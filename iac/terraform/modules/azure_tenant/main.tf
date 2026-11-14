# ==============================================================================
# Módulo: azure_tenant
# Configuración del Provider, Mapeo de Planes y Resource Group
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.95"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

locals {
  # Catálogo dinámico de VM Sizes y discos en Azure según el Plan
  plan_configs = {
    basico = {
      frontend_size = "Standard_B1ls"
      backend_size  = "Standard_B1ls"
      db_size       = "Standard_B1s"
      disk_size_gb  = 10
      storage_type  = "Standard_LRS"
    }
    estandar = {
      frontend_size = "Standard_B1s"
      backend_size  = "Standard_B1s"
      db_size       = "Standard_B2s"
      disk_size_gb  = 20
      storage_type  = "StandardSSD_LRS"
    }
    avanzado = {
      frontend_size = "Standard_B2s"
      backend_size  = "Standard_B2s"
      db_size       = "Standard_B2ms"
      disk_size_gb  = 30
      storage_type  = "Premium_LRS"
    }
  }

  selected_plan = local.plan_configs[var.plan]

  common_tags = {
    TenantId    = var.tenant_id
    Environment = var.environment
    Plan        = var.plan
    Project     = "SistemaAsistencia"
    ManagedBy   = "Terraform"
  }
}

# Resource Group dedicado por Tenant
resource "azurerm_resource_group" "tenant_rg" {
  name     = "rg-${var.tenant_id}"
  location = var.azure_location
  tags     = local.common_tags
}
