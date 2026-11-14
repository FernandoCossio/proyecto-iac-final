#!/usr/bin/env bash
# ==============================================================================
# Script: setup-common.sh
# Propósito: Configuración base compartida para todas las imágenes de Packer
# SO Objetivo: Ubuntu 22.04 LTS
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo ">>> [setup-common] Iniciando aprovisionamiento base..."
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Actualización de repositorios y paquetes base
sudo apt-get update -y
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y universe
sudo apt-get update -y
sudo apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# 2. Configurar Timezone en UTC
sudo timedatectl set-timezone UTC || sudo ln -sf /usr/share/zoneinfo/UTC /etc/localtime

# 3. Instalación de herramientas esenciales del sistema
sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  wget \
  git \
  unzip \
  tar \
  htop \
  ufw \
  gnupg \
  lsb-release \
  python3

# 4. Instalación de jq (binario estático oficial v1.7.1)
sudo wget -q "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64" -O /usr/local/bin/jq
sudo chmod +x /usr/local/bin/jq

# 5. Configuración inicial del Firewall UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH para administracion/bastion'
sudo ufw --force enable

# 6. Instalación de Prometheus node_exporter para observabilidad
NODE_EXPORTER_VERSION="1.8.2"
echo ">>> Instalando node_exporter v${NODE_EXPORTER_VERSION}..."

NODE_EXPORTER_TAR="node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"
wget -q "https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/${NODE_EXPORTER_TAR}" -O "/tmp/${NODE_EXPORTER_TAR}"

sudo tar -xzf "/tmp/${NODE_EXPORTER_TAR}" -C /tmp/
sudo mv "/tmp/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter" /usr/local/bin/node_exporter
sudo chmod +x /usr/local/bin/node_exporter
sudo rm -rf "/tmp/${NODE_EXPORTER_TAR}" "/tmp/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64"

# Crear usuario de sistema dedicado para node_exporter
if ! id "node_exporter" &>/dev/null; then
  sudo useradd --no-create-home --shell /bin/false node_exporter
fi

# Crear servicio systemd para node_exporter
sudo tee /etc/systemd/system/node_exporter.service > /dev/null << 'EOF'
[Unit]
Description=Prometheus Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter.service
sudo systemctl start node_exporter.service

echo "=========================================================="
echo ">>> [setup-common] Aprovisionamiento base completado OK"
echo "=========================================================="
