#!/usr/bin/env bash
# ==============================================================================
# Script: setup-frontend.sh
# Propósito: Aprovisionamiento específico para imagen 'asistencia-frontend'
# Componentes: Node.js 22 LTS, Nginx Reverse Proxy, directorios de despliegue
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo ">>> [setup-frontend] Instalando Node.js 22 LTS y Nginx..."
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Instalar Node.js 22 LTS desde NodeSource
NODE_MAJOR=22
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes

echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

sudo apt-get update -y
sudo apt-get install -y nodejs

echo ">>> Node.js instalado: $(node -v) | npm: $(npm -v)"

# 2. Instalar PM2 para gestión de procesos Next.js
sudo npm install -g pm2

# 3. Instalar y configurar Nginx
sudo apt-get install -y nginx

# Permitir puertos HTTP y HTTPS en UFW
sudo ufw allow 80/tcp comment 'HTTP Nginx'
sudo ufw allow 443/tcp comment 'HTTPS Nginx'
sudo ufw allow 9100/tcp comment 'Prometheus node_exporter'

# Configuración base de Nginx para reverse proxy
sudo tee /etc/nginx/sites-available/asistencia-frontend > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Headers de seguridad
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend Next.js (SSR / Standalone en puerto 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Healthcheck para balanceadores de carga / probes
    location /health {
        access_log off;
        return 200 '{"status":"ok","component":"frontend"}';
        add_header Content-Type application/json;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/asistencia-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 4. Crear directorio de despliegue para Next.js
sudo mkdir -p /var/www/frontend
sudo chown -R ubuntu:ubuntu /var/www/frontend || sudo chown -R $USER:$USER /var/www/frontend
sudo chmod -R 755 /var/www/frontend

echo "=========================================================="
echo ">>> [setup-frontend] Aprovisionamiento completado con éxito"
echo "=========================================================="
