# ==============================================================================
# Outputs del Módulo aws_tenant
# ==============================================================================

output "tenant_id" {
  description = "Identificador único del tenant aprovisionado."
  value       = var.tenant_id
}

output "vpc_id" {
  description = "ID de la VPC dedicada creada para el tenant."
  value       = aws_vpc.tenant_vpc.id
}

output "frontend_public_ip" {
  description = "IP pública asignada al Frontend (Punto de acceso web y Bastion SSH)."
  value       = aws_instance.frontend.public_ip
}

output "frontend_private_ip" {
  description = "IP privada asignada al Frontend."
  value       = aws_instance.frontend.private_ip
}

output "backend_private_ip" {
  description = "IP privada interna asignada al Backend NestJS."
  value       = aws_instance.backend.private_ip
}

output "database_private_ip" {
  description = "IP privada interna asignada a PostgreSQL 16."
  value       = aws_instance.database.private_ip
}

output "ansible_inventory_path" {
  description = "Ruta al archivo inventory.ini generado para Ansible."
  value       = local_file.ansible_inventory.filename
}

output "inventory_file_path" {
  description = "Ruta al archivo inventory.ini generado para Ansible (alias retrocompatible)."
  value       = local_file.ansible_inventory.filename
}
