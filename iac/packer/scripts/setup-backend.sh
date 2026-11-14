#!/usr/bin/env bash
# ==============================================================================
# Script: setup-backend.sh
# Propósito: Aprovisionamiento específico para imagen 'asistencia-backend'
# Componentes: Node.js 22 LTS, PM2, Build Tools, directorios de despliegue
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo ">>> [setup-backend] Instalando Node.js 22 LTS y PM2..."
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Instalar Node.js 22 LTS desde NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

echo ">>> Node.js instalado: $(node -v) | npm: $(npm -v)"

# 2. Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar en boot con usuario ubuntu
if id "ubuntu" &>/dev/null; then
  sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
fi

# 3. Configuración de firewall UFW para Backend (puerto 3000 y telemetría 9100)
sudo ufw allow 3000/tcp comment 'API NestJS Backend'
sudo ufw allow 9100/tcp comment 'Prometheus node_exporter'

# 4. Crear directorio de despliegue para NestJS
sudo mkdir -p /var/www/backend
sudo chown -R ubuntu:ubuntu /var/www/backend || sudo chown -R $USER:$USER /var/www/backend
sudo chmod -R 755 /var/www/backend

echo "=========================================================="
echo ">>> [setup-backend] Aprovisionamiento completado con éxito"
echo "=========================================================="
