# ==============================================================================
# Virtual Machines Dedicadas para las 3 Capas del Tenant en Azure
# ==============================================================================

# 1. Máquina Virtual Frontend (Next.js SSR + Nginx + Bastion SSH)
resource "azurerm_linux_virtual_machine" "frontend" {
  name                  = "vm-${var.tenant_id}-frontend"
  resource_group_name   = azurerm_resource_group.tenant_rg.name
  location              = azurerm_resource_group.tenant_rg.location
  size                  = local.selected_plan.frontend_size
  admin_username        = "ubuntu"
  network_interface_ids = [azurerm_network_interface.frontend.id]

  admin_ssh_key {
    username   = "ubuntu"
    public_key = var.ssh_public_key
  }

  os_disk {
    name                 = "osdisk-${var.tenant_id}-frontend"
    caching              = "ReadWrite"
    storage_account_type = local.selected_plan.storage_type
    disk_size_gb         = local.selected_plan.disk_size_gb
  }

  source_image_id = local.resolved_frontend_image_id

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-frontend"
    Tier = "Frontend"
  })
}

# 2. Máquina Virtual Backend (NestJS API - Subred Privada)
resource "azurerm_linux_virtual_machine" "backend" {
  name                  = "vm-${var.tenant_id}-backend"
  resource_group_name   = azurerm_resource_group.tenant_rg.name
  location              = azurerm_resource_group.tenant_rg.location
  size                  = local.selected_plan.backend_size
  admin_username        = "ubuntu"
  network_interface_ids = [azurerm_network_interface.backend.id]

  admin_ssh_key {
    username   = "ubuntu"
    public_key = var.ssh_public_key
  }

  os_disk {
    name                 = "osdisk-${var.tenant_id}-backend"
    caching              = "ReadWrite"
    storage_account_type = local.selected_plan.storage_type
    disk_size_gb         = local.selected_plan.disk_size_gb
  }

  source_image_id = local.resolved_backend_image_id

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-backend"
    Tier = "Backend"
  })
}

# 3. Máquina Virtual Database (PostgreSQL 16 - Subred Aislada)
resource "azurerm_linux_virtual_machine" "database" {
  name                  = "vm-${var.tenant_id}-database"
  resource_group_name   = azurerm_resource_group.tenant_rg.name
  location              = azurerm_resource_group.tenant_rg.location
  size                  = local.selected_plan.db_size
  admin_username        = "ubuntu"
  network_interface_ids = [azurerm_network_interface.database.id]

  admin_ssh_key {
    username   = "ubuntu"
    public_key = var.ssh_public_key
  }

  os_disk {
    name                 = "osdisk-${var.tenant_id}-database"
    caching              = "ReadWrite"
    storage_account_type = local.selected_plan.storage_type
    disk_size_gb         = local.selected_plan.disk_size_gb
  }

  source_image_id = local.resolved_database_image_id

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-database"
    Tier = "Database"
  })
}
