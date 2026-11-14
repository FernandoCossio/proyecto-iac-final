# ==============================================================================
# Security Groups Encadenados por Capa (Aislamiento Estricto)
# ==============================================================================

# 1. Security Group: Frontend (Expuesto al público en 80/443 + SSH Restringido)
resource "aws_security_group" "frontend" {
  #checkov:skip=CKV_AWS_260:Frontend requires public HTTP ingress for web traffic
  #checkov:skip=CKV_AWS_24:SSH ingress allows administrator access per configurable variable
  #checkov:skip=CKV_AWS_382:Egress to internet required for OS packages, updates, and APIs
  name        = "${var.tenant_id}-sg-frontend"
  description = "Reglas de trafico para Frontend y Bastion SSH"
  vpc_id      = aws_vpc.tenant_vpc.id

  # HTTP Publico
  ingress {
    description = "HTTP desde Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Publico
  ingress {
    description = "HTTPS desde Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH Restringido al Operador
  ingress {
    description = "SSH de Administracion al Bastion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ssh_ip]
  }

  # Forwarding NAT desde VPC
  ingress {
    description = "Forwarding NAT desde subredes internas de la VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  # Salida libre hacia Internet y VPC
  egress {
    description = "Salida general a internet para actualizaciones y resolucion de dependencias"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-sg-frontend"
    Tier = "Frontend"
  })
}

# 2. Security Group: Backend (Solo accesible desde Frontend en puerto 3000 y 22)
resource "aws_security_group" "backend" {
  name        = "${var.tenant_id}-sg-backend"
  description = "Reglas de trafico para Backend NestJS"
  vpc_id      = aws_vpc.tenant_vpc.id

  # API NestJS solo desde Frontend SG
  ingress {
    description     = "API NestJS exclusivo desde Frontend Nginx"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  # SSH Bastion Jump desde Frontend SG
  ingress {
    description     = "SSH interno via Bastion Frontend"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  # Salida hacia subredes de la VPC y a Internet via NAT Bastion
  egress {
    description = "Salida hacia la VPC y salida a Internet via NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-sg-backend"
    Tier = "Backend"
  })
}

# 3. Security Group: Database (Solo accesible desde Backend en 5432 y Frontend en 22)
resource "aws_security_group" "database" {
  name        = "${var.tenant_id}-sg-database"
  description = "Reglas de trafico para PostgreSQL 16"
  vpc_id      = aws_vpc.tenant_vpc.id

  # PostgreSQL solo desde Backend SG
  ingress {
    description     = "PostgreSQL exclusivo desde Backend NestJS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  # SSH Bastion Jump desde Frontend SG para administracion / Ansible
  ingress {
    description     = "SSH interno via Bastion Frontend"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  # Salida restringida a la VPC interna
  egress {
    description = "Salida hacia la VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-sg-database"
    Tier = "Database"
  })
}
