# ==============================================================================
# Entorno Azure: Instanciación del Módulo azure_tenant con OpenTofu
# ==============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "opentofu/azurerm"
      version = "~> 3.95"
    }
    local = {
      source  = "opentofu/local"
      version = "~> 2.4"
    }
  }
}

provider "azurerm" {
  features {}
}

module "tenant" {
  source = "../../modules/azure_tenant"

  tenant_id                    = var.tenant_id
  environment                  = var.environment
  azure_location               = var.azure_location
  plan                         = var.plan
  vnet_address_space           = var.vnet_address_space
  public_subnet_cidr           = var.public_subnet_cidr
  private_backend_subnet_cidr  = var.private_backend_subnet_cidr
  isolated_db_subnet_cidr      = var.isolated_db_subnet_cidr
  admin_ssh_ip                 = var.admin_ssh_ip
  ssh_public_key               = var.ssh_public_key
  ssh_private_key_path         = var.ssh_private_key_path
  managed_image_resource_group = var.managed_image_resource_group
  image_prefix                 = var.image_prefix
  app_version                  = var.app_version
  frontend_image_id            = var.frontend_image_id
  backend_image_id             = var.backend_image_id
  database_image_id            = var.database_image_id
  inventory_output_dir         = var.inventory_output_dir
}
