# ==============================================================================
# Entorno AWS: Instanciación del Módulo aws_tenant
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "tenant" {
  source = "../../modules/aws_tenant"

  tenant_id                   = var.tenant_id
  environment                 = var.environment
  aws_region                  = var.aws_region
  plan                        = var.plan
  vpc_cidr                    = var.vpc_cidr
  public_subnet_cidr          = var.public_subnet_cidr
  private_backend_subnet_cidr = var.private_backend_subnet_cidr
  isolated_db_subnet_cidr     = var.isolated_db_subnet_cidr
  admin_ssh_ip                = var.admin_ssh_ip
  ssh_key_name                = var.ssh_key_name
  ssh_public_key              = var.ssh_public_key
  ssh_private_key_path        = var.ssh_private_key_path
  inventory_output_dir        = var.inventory_output_dir
}
