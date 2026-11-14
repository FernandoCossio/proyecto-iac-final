# ==============================================================================
# Packer Template: Azure Managed Image para 'asistencia-database'
# Componentes: Ubuntu 22.04 LTS Gen2, PostgreSQL 16 PGDG, Tuning Base, node_exporter
# ==============================================================================

packer {
  required_plugins {
    azure = {
      version = ">= 2.1.0"
      source  = "github.com/hashicorp/azure"
    }
  }
}

source "azure-arm" "database" {
  subscription_id                   = var.azure_subscription_id
  client_id                         = var.azure_client_id
  client_secret                     = var.azure_client_secret
  tenant_id                         = var.azure_tenant_id
  managed_image_resource_group_name = var.azure_resource_group
  managed_image_name                = "${var.image_prefix}-database-${var.app_version}-{{timestamp}}"
  location                          = var.azure_location
  vm_size                           = var.vm_size
  ssh_username                      = var.ssh_username

  os_type         = "Linux"
  image_publisher = "Canonical"
  image_offer     = "0001-com-ubuntu-server-jammy"
  image_sku       = "22_04-lts-gen2"

  azure_tags = {
    Name      = "${var.image_prefix}-database-${var.app_version}"
    Project   = "SistemaAsistencia"
    Component = "database"
    Version   = var.app_version
    ManagedBy = "Packer"
    OS        = "Ubuntu-22.04"
  }
}

build {
  name    = "asistencia-database-azure"
  sources = ["source.azure-arm.database"]

  provisioner "shell" {
    scripts = [
      "${path.root}/../scripts/setup-common.sh",
      "${path.root}/../scripts/setup-database.sh",
      "${path.root}/../scripts/cleanup.sh"
    ]
  }
}
