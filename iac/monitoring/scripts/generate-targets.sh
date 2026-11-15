#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../targets"
INVENTORY_DIR="${SCRIPT_DIR}/../../ansible/inventory"

mkdir -p "${OUTPUT_DIR}"

convert_inventory() {
  local inv_file="$1"
  local tenant
  local env
  local fe_ip
  local be_ip
  local db_ip

  tenant=$(grep -E '^tenant_id=' "$inv_file" | cut -d'=' -f2 | tr -d ' ' || echo "tenant")
  env=$(grep -E '^environment=' "$inv_file" | cut -d'=' -f2 | tr -d ' ' || echo "dev")
  fe_ip=$(grep -E '^frontend-node' "$inv_file" | grep -oE 'ansible_host=[^ ]+' | cut -d'=' -f2 || true)
  be_ip=$(grep -E '^backend-node' "$inv_file" | grep -oE 'ansible_host=[^ ]+' | cut -d'=' -f2 || true)
  db_ip=$(grep -E '^db-node' "$inv_file" | grep -oE 'ansible_host=[^ ]+' | cut -d'=' -f2 || true)

  cat <<EOF > "${OUTPUT_DIR}/${tenant}.json"
[
  {
    "targets": ["${fe_ip}:9100"],
    "labels": {
      "tenant": "${tenant}",
      "plan": "estandar",
      "tier": "frontend",
      "environment": "${env}",
      "role": "web-bastion"
    }
  },
  {
    "targets": ["${be_ip}:9100"],
    "labels": {
      "tenant": "${tenant}",
      "plan": "estandar",
      "tier": "backend",
      "environment": "${env}",
      "role": "api"
    }
  },
  {
    "targets": ["${db_ip}:9100"],
    "labels": {
      "tenant": "${tenant}",
      "plan": "estandar",
      "tier": "database",
      "environment": "${env}",
      "role": "postgres"
    }
  }
]
EOF
  echo ">>> [OK] Target Prometheus generado: ${OUTPUT_DIR}/${tenant}.json"
}

shopt -s nullglob
files=("${INVENTORY_DIR}"/inventory-*.ini)
if [ ${#files[@]} -eq 0 ]; then
  echo "No se encontraron inventarios en ${INVENTORY_DIR}"
else
  for f in "${files[@]}"; do
    convert_inventory "$f"
  done
fi
