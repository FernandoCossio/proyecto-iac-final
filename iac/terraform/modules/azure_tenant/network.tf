# ==============================================================================
# Redes de 3 Capas en Azure (VNet, Subnets, NICs)
# ==============================================================================

# 1. Virtual Network Dedicada por Tenant
resource "azurerm_virtual_network" "tenant_vnet" {
  name                = "vnet-${var.tenant_id}"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  address_space       = [var.vnet_address_space]
  tags                = local.common_tags
}

# 2. Subred Frontend Pública
resource "azurerm_subnet" "frontend" {
  name                 = "snet-${var.tenant_id}-frontend"
  resource_group_name  = azurerm_resource_group.tenant_rg.name
  virtual_network_name = azurerm_virtual_network.tenant_vnet.name
  address_prefixes     = [var.public_subnet_cidr]
}

# 3. Subred Backend Privada
resource "azurerm_subnet" "backend" {
  name                 = "snet-${var.tenant_id}-backend"
  resource_group_name  = azurerm_resource_group.tenant_rg.name
  virtual_network_name = azurerm_virtual_network.tenant_vnet.name
  address_prefixes     = [var.private_backend_subnet_cidr]
}

# 4. Subred Database Aislada
resource "azurerm_subnet" "database" {
  name                 = "snet-${var.tenant_id}-database"
  resource_group_name  = azurerm_resource_group.tenant_rg.name
  virtual_network_name = azurerm_virtual_network.tenant_vnet.name
  address_prefixes     = [var.isolated_db_subnet_cidr]
}

# 5. IP Pública para el Frontend (Bastion SSH + Acceso Web)
resource "azurerm_public_ip" "frontend" {
  name                = "pip-${var.tenant_id}-frontend"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

# 6. Interfaz de Red (NIC) Frontend
resource "azurerm_network_interface" "frontend" {
  name                = "nic-${var.tenant_id}-frontend"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  ip_configuration {
    name                          = "ipconfig-frontend"
    subnet_id                     = azurerm_subnet.frontend.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.frontend.id
  }
}

# 7. Interfaz de Red (NIC) Backend
resource "azurerm_network_interface" "backend" {
  name                = "nic-${var.tenant_id}-backend"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  ip_configuration {
    name                          = "ipconfig-backend"
    subnet_id                     = azurerm_subnet.backend.id
    private_ip_address_allocation = "Dynamic"
  }
}

# 8. Interfaz de Red (NIC) Database
resource "azurerm_network_interface" "database" {
  name                = "nic-${var.tenant_id}-database"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  ip_configuration {
    name                          = "ipconfig-database"
    subnet_id                     = azurerm_subnet.database.id
    private_ip_address_allocation = "Dynamic"
  }
}
