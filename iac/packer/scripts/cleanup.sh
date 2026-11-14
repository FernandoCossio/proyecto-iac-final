#!/usr/bin/env bash
# ==============================================================================
# Script: cleanup.sh
# Propósito: Limpieza pre-snapshot para generar Golden Images inmutables y limpias
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo ">>> [cleanup] Iniciando limpieza de logs y temporales..."
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Limpieza de caches de paquetes APT
sudo apt-get autoremove -y --purge
sudo apt-get clean -y
sudo rm -rf /var/lib/apt/lists/*

# 2. Limpieza de directorios temporales
sudo rm -rf /tmp/* /var/tmp/*

# 3. Limpieza de llaves SSH temporales usadas durante el build
sudo rm -f /root/.ssh/authorized_keys
sudo rm -f /home/ubuntu/.ssh/authorized_keys || true

# 4. Truncar y limpiar logs del sistema
sudo find /var/log -type f -exec truncate --size 0 {} +
sudo find /var/log -type f \( -name "*.gz" -o -name "*.[0-9]" \) -delete 2>/dev/null || true

# 5. Resetear cloud-init para que se re-ejecute en la nueva instancia
if [ -d /var/lib/cloud ]; then
  sudo cloud-init clean --logs --seed
fi

# 6. Limpiar machine-id para evitar colisiones de DHCP/leases
if [ -f /etc/machine-id ]; then
  sudo truncate -s 0 /etc/machine-id
fi
if [ -f /var/lib/dbus/machine-id ]; then
  sudo truncate -s 0 /var/lib/dbus/machine-id
fi

# 7. Sincronizar cambios a disco
sync

echo "=========================================================="
echo ">>> [cleanup] Limpieza completada. Imagen lista para snapshot"
echo "=========================================================="
