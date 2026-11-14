#!/usr/bin/env bash
# ==============================================================================
# Orquestador Central de Scanners DevSecOps para CI/CD (IaC)
# ==============================================================================
set -e

echo "=========================================================="
echo ">>> [DevSecOps] Iniciando Suite de Scanners de Seguridad"
echo "=========================================================="

echo ">>> [1/5] Escaneo de Secretos con Gitleaks..."
gitleaks detect --source . --config .gitleaks.toml --verbose --no-git

echo ">>> [2/5] Linting de Terraform y OpenTofu con TFLint..."
tflint --chdir=iac/terraform --recursive
tflint --chdir=iac/opentofu --recursive

echo ">>> [3/5] Validación de CloudFormation con cfn-lint..."
cfn-lint iac/cloudformation/templates/*.yaml

echo ">>> [4/5] Seguridad IaC Unificada con Checkov..."
checkov --config-file .checkov.yaml -d iac/terraform/modules/
checkov --config-file .checkov.yaml -d iac/opentofu/modules/
checkov --config-file .checkov.yaml -f iac/cloudformation/templates/tenant-stack.yaml
if [ -d "iac/ansible" ]; then
  checkov --config-file .checkov.yaml -d iac/ansible/ --framework ansible
fi

echo ">>> [5/5] Compilación y Validación de Pulumi y Policy Pack..."
cd iac/pulumi && npm run build && cd ../..
cd iac/pulumi/policy-pack && npm run build && cd ../../..

echo "=========================================================="
echo "✅ Quality Gate DevSecOps: Todos los controles pasaron OK."
echo "=========================================================="
