# ==============================================================================
# Network Security Groups (NSGs) y Reglas de Aislamiento en Azure
# ==============================================================================

# 1. NSG Frontend: Acceso Web y SSH de Administracion
resource "azurerm_network_security_group" "frontend" {
  #checkov:skip=CKV_AZURE_160:Frontend requires public HTTP ingress for web traffic
  name                = "nsg-${var.tenant_id}-frontend"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  security_rule {
    name                       = "Allow-HTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-HTTPS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-SSH"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.admin_ssh_ip
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-NodeExporter"
    priority                   = 130
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "9100"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "frontend" {
  subnet_id                 = azurerm_subnet.frontend.id
  network_security_group_id = azurerm_network_security_group.frontend.id
}

# 2. NSG Backend: API NestJS y SSH solo desde Subred Frontend
resource "azurerm_network_security_group" "backend" {
  name                = "nsg-${var.tenant_id}-backend"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  security_rule {
    name                       = "Allow-API-From-Frontend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000"
    source_address_prefix      = var.public_subnet_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-SSH-From-Frontend"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.public_subnet_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deny-All-Other-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "backend" {
  subnet_id                 = azurerm_subnet.backend.id
  network_security_group_id = azurerm_network_security_group.backend.id
}

# 3. NSG Database: PostgreSQL solo desde Backend y SSH desde Frontend
resource "azurerm_network_security_group" "database" {
  name                = "nsg-${var.tenant_id}-database"
  resource_group_name = azurerm_resource_group.tenant_rg.name
  location            = azurerm_resource_group.tenant_rg.location
  tags                = local.common_tags

  security_rule {
    name                       = "Allow-Postgres-From-Backend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = var.private_backend_subnet_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-SSH-From-Frontend"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.public_subnet_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deny-All-Other-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database.id
}
