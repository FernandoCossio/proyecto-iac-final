#!/usr/bin/env bash
set -e

STACK_NAME="${1:-tenant-cfn-test}"
PARAM_FILE="${2:-$(dirname "$0")/../parameters/tenant-basico.json}"
AWS_REGION="${3:-us-east-2}"
TEMPLATE_FILE="$(dirname "$0")/../templates/tenant-stack.yaml"

echo "Desplegando stack '$STACK_NAME' con plantilla '$TEMPLATE_FILE' en '$AWS_REGION'..."
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides $(jq -r '.[] | "\(.ParameterKey)=\(.ParameterValue)"' "$PARAM_FILE") \
  --region "$AWS_REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

echo "Despliegue de CloudFormation finalizado exitosamente."
