# ==============================================================================
# Generador de Inventario Ansible para Azure (Contrato de Salida Común)
# ==============================================================================

resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/templates/inventory.ini.tpl", {
    tenant_id          = var.tenant_id
    environment        = var.environment
    frontend_public_ip = azurerm_public_ip.frontend.ip_address
    backend_private_ip = azurerm_network_interface.backend.private_ip_address
    db_private_ip      = azurerm_network_interface.database.private_ip_address
    ssh_user           = "ubuntu"
    ssh_private_key    = var.ssh_private_key_path
  })

  filename        = "${path.root}/${var.inventory_output_dir}/inventory-${var.tenant_id}.ini"
  file_permission = "0644"
}
