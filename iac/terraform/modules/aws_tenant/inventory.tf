# ==============================================================================
# Generador de Inventario Ansible (Contrato de Salida Común)
# ==============================================================================

resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/templates/inventory.ini.tpl", {
    tenant_id          = var.tenant_id
    environment        = var.environment
    frontend_public_ip = aws_instance.frontend.public_ip
    backend_private_ip = aws_instance.backend.private_ip
    db_private_ip      = aws_instance.database.private_ip
    ssh_user           = "ubuntu"
    ssh_private_key    = var.ssh_private_key_path
  })

  filename        = "${path.root}/${var.inventory_output_dir}/inventory-${var.tenant_id}.ini"
  file_permission = "0644"
}
