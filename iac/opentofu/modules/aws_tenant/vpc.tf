# ==============================================================================
# Redes Aisladas de 3 Capas para el Tenant
# ==============================================================================

# 1. VPC Dedicada por Tenant
resource "aws_vpc" "tenant_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-vpc"
  })
}

# 2. Internet Gateway (Conectado únicamente a la subred pública Frontend)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.tenant_vpc.id

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-igw"
  })
}

# 3. Subred Pública (Capa 1: Frontend Next.js + Bastion SSH)
resource "aws_subnet" "frontend" {
  vpc_id                  = aws_vpc.tenant_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-subnet-frontend-public"
    Tier = "Frontend"
  })
}

# 4. Subred Privada (Capa 2: Backend NestJS - Sin IP pública)
resource "aws_subnet" "backend" {
  vpc_id                  = aws_vpc.tenant_vpc.id
  cidr_block              = var.private_backend_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-subnet-backend-private"
    Tier = "Backend"
  })
}

# 5. Subred Aislada (Capa 3: Database PostgreSQL 16 - Sin Internet ni IP pública)
resource "aws_subnet" "database" {
  vpc_id                  = aws_vpc.tenant_vpc.id
  cidr_block              = var.isolated_db_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-subnet-db-isolated"
    Tier = "Database"
  })
}

# 6. Tabla de Ruteo Pública (Salida directa al Internet Gateway)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.tenant_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-rt-public"
  })
}

resource "aws_route_table_association" "frontend" {
  subnet_id      = aws_subnet.frontend.id
  route_table_id = aws_route_table.public.id
}

# 7. Tabla de Ruteo Privada (Solo tráfico interno entre subredes de la VPC, sin NAT Gateway = $0)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.tenant_vpc.id

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-rt-private-isolated"
  })
}

resource "aws_route_table_association" "backend" {
  subnet_id      = aws_subnet.backend.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "database" {
  subnet_id      = aws_subnet.database.id
  route_table_id = aws_route_table.private.id
}
