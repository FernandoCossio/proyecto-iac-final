#!/usr/bin/env bash
set -e

STACK_NAME="$1"
SSH_KEY_PATH="$2"
AWS_REGION="${3:-us-east-2}"
OUTPUT_DIR="${4:-$(cd "$(dirname "$0")/../../ansible/inventory" && pwd)}"

if [ -z "$STACK_NAME" ] || [ -z "$SSH_KEY_PATH" ]; then
  echo "Uso: $0 <stack-name> <ssh-key-path> [aws-region] [output-dir]"
  exit 1
fi

echo "Consultando outputs del stack '$STACK_NAME' en region '$AWS_REGION'..."
OUTPUTS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query "Stacks[0].Outputs" --output json)

TENANT_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="TenantId") | .OutputValue')
FRONTEND_IP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="FrontendPublicIp") | .OutputValue')
BACKEND_IP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="BackendPrivateIp") | .OutputValue')
DB_IP=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DatabasePrivateIp") | .OutputValue')

if [ -z "$TENANT_ID" ] || [ -z "$FRONTEND_IP" ]; then
  echo "Error: No se pudieron extraer los outputs del stack '$STACK_NAME'."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
INVENTORY_FILE="${OUTPUT_DIR}/inventory-${TENANT_ID}.ini"

cat <<EOF > "$INVENTORY_FILE"
# ==============================================================================
# Inventario Dinamico de Ansible generado por AWS CloudFormation
# Tenant: ${TENANT_ID} | Stack: ${STACK_NAME}
# ==============================================================================

[frontend]
frontend-node ansible_host=${FRONTEND_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${SSH_KEY_PATH}

[backend]
backend-node ansible_host=${BACKEND_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${SSH_KEY_PATH} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${FRONTEND_IP} -i ${SSH_KEY_PATH} -o StrictHostKeyChecking=no"'

[database]
db-node ansible_host=${DB_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${SSH_KEY_PATH} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${FRONTEND_IP} -i ${SSH_KEY_PATH} -o StrictHostKeyChecking=no"'

[all:vars]
tenant_id=${TENANT_ID}
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
EOF

echo "Inventario generado exitosamente en: $INVENTORY_FILE"
