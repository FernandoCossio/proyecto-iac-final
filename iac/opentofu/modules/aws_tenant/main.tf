# ==============================================================================
# Módulo: aws_tenant
# Configuración del Provider, Mapeo de Planes y Tags
# ==============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "opentofu/aws"
      version = "~> 5.40"
    }
    local = {
      source  = "opentofu/local"
      version = "~> 2.4"
    }
  }
}

locals {
  # Catálogo dinámico de hardware y almacenamiento según el Plan
  plan_configs = {
    basico = {
      frontend_type = "t3.micro"
      backend_type  = "t3.micro"
      db_type       = "t3.micro"
      disk_size_gb  = 10
    }
    estandar = {
      frontend_type = "t3.small"
      backend_type  = "t3.small"
      db_type       = "t3.small"
      disk_size_gb  = 20
    }
    avanzado = {
      frontend_type = "t3.small"
      backend_type  = "t3.small"
      db_type       = "t3.medium"
      disk_size_gb  = 30
    }
  }

  selected_plan = local.plan_configs[var.plan]

  common_tags = {
    TenantId    = var.tenant_id
    Environment = var.environment
    Plan        = var.plan
    Project     = "SistemaAsistencia"
    ManagedBy   = "OpenTofu"
  }
}
