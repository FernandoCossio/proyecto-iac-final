# ==============================================================================
# Descubrimiento Dinámico de Managed Images de Packer en Azure
# ==============================================================================

data "azurerm_image" "frontend" {
  count               = var.frontend_image_id == null ? 1 : 0
  name                = "${var.image_prefix}-frontend-${var.app_version}"
  resource_group_name = var.managed_image_resource_group
}

data "azurerm_image" "backend" {
  count               = var.backend_image_id == null ? 1 : 0
  name                = "${var.image_prefix}-backend-${var.app_version}"
  resource_group_name = var.managed_image_resource_group
}

data "azurerm_image" "database" {
  count               = var.database_image_id == null ? 1 : 0
  name                = "${var.image_prefix}-database-${var.app_version}"
  resource_group_name = var.managed_image_resource_group
}

locals {
  resolved_frontend_image_id = var.frontend_image_id != null ? var.frontend_image_id : try(data.azurerm_image.frontend[0].id, null)
  resolved_backend_image_id  = var.backend_image_id != null ? var.backend_image_id : try(data.azurerm_image.backend[0].id, null)
  resolved_database_image_id = var.database_image_id != null ? var.database_image_id : try(data.azurerm_image.database[0].id, null)
}
