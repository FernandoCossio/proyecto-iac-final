#!/usr/bin/env bash
# ==============================================================================
# Script: setup-database.sh
# Propósito: Aprovisionamiento específico para imagen 'asistencia-database'
# Componentes: PostgreSQL 16 (PGDG oficial), tuning de configuración base
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo ">>> [setup-database] Instalando PostgreSQL 16..."
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Agregar repositorio oficial de PostgreSQL (PGDG)
sudo install -d /etc/apt/keyrings
curl --retry 5 --retry-delay 2 --retry-connrefused -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /tmp/postgresql.asc
sudo gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg --yes /tmp/postgresql.asc
rm -f /tmp/postgresql.asc

echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

sudo apt-get update -y
sudo apt-get install -y postgresql-16 postgresql-contrib-16 python3-psycopg2

# 2. Configurar PostgreSQL para escuchar en todas las interfaces de red internas
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
PG_HBA="/etc/postgresql/16/main/pg_hba.conf"

echo ">>> Ajustando postgresql.conf..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"

# Configuración básica de memoria y rendimiento para instancias Cloud (t3.micro / B1s)
sudo tee -a "$PG_CONF" > /dev/null << 'EOF'

# --- Tuning Base para Cloud Multi-Tenant ---
shared_buffers = 256MB
work_mem = 16MB
maintenance_work_mem = 64MB
effective_cache_size = 768MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# 3. Preparar pg_hba.conf para permitir autenticación por scram-sha-256 desde redes privadas
echo ">>> Ajustando pg_hba.conf..."
sudo tee -a "$PG_HBA" > /dev/null << 'EOF'

# Autorizar conexiones desde subredes privadas RFC1918 vía scram-sha-256
host    all             all             10.0.0.0/8              scram-sha-256
host    all             all             172.16.0.0/12           scram-sha-256
host    all             all             192.168.0.0/16          scram-sha-256
EOF

# 4. Habilitar y reiniciar servicio PostgreSQL
sudo systemctl enable postgresql
sudo systemctl restart postgresql

# 5. Configurar firewall UFW para PostgreSQL (5432) y telemetría (9100)
sudo ufw allow 5432/tcp comment 'PostgreSQL Database'
sudo ufw allow 9100/tcp comment 'Prometheus node_exporter'

echo "=========================================================="
echo ">>> [setup-database] PostgreSQL 16 instalado y listo"
echo "=========================================================="
