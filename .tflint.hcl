# ==============================================================================
# Configuración Centralizada de TFLint para Terraform y OpenTofu
# ==============================================================================
config {
  call_module_type = "all"
  force = false
}

plugin "aws" {
  enabled = true
  version = "0.30.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

plugin "azurerm" {
  enabled = true
  version = "0.25.0"
  source  = "github.com/terraform-linters/tflint-ruleset-azurerm"
}
