# ==============================================================================
# Outputs del Módulo Azure Tenant
# ==============================================================================

output "tenant_id" {
  value       = var.tenant_id
  description = "Identificador del tenant desplegado"
}

output "frontend_public_ip" {
  value       = azurerm_public_ip.frontend.ip_address
  description = "IP pública del Frontend / Bastion SSH"
}

output "frontend_private_ip" {
  value       = azurerm_network_interface.frontend.private_ip_address
  description = "IP privada de la instancia Frontend"
}

output "backend_private_ip" {
  value       = azurerm_network_interface.backend.private_ip_address
  description = "IP privada de la instancia Backend"
}

output "database_private_ip" {
  value       = azurerm_network_interface.database.private_ip_address
  description = "IP privada de la instancia Database"
}

output "ansible_inventory_path" {
  value       = local_file.ansible_inventory.filename
  description = "Ruta al inventario generado de Ansible"
}
