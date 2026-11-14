# ==============================================================================
# Outputs del Entorno Azure Tenant
# ==============================================================================

output "tenant_id" {
  value       = module.tenant.tenant_id
  description = "Identificador del tenant desplegado"
}

output "frontend_public_ip" {
  value       = module.tenant.frontend_public_ip
  description = "IP pública del Frontend / Bastion SSH"
}

output "frontend_private_ip" {
  value       = module.tenant.frontend_private_ip
  description = "IP privada del Frontend"
}

output "backend_private_ip" {
  value       = module.tenant.backend_private_ip
  description = "IP privada del Backend"
}

output "database_private_ip" {
  value       = module.tenant.database_private_ip
  description = "IP privada de la Database"
}

output "ansible_inventory_path" {
  value       = module.tenant.ansible_inventory_path
  description = "Ruta al inventario generado de Ansible"
}
