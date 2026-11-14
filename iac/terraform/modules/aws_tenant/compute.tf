# ==============================================================================
# Instancias EC2 Dedicadas para las 3 Capas del Tenant
# ==============================================================================

# 1. Gestión de Llave SSH
resource "aws_key_pair" "tenant_key" {
  count      = var.ssh_key_name == null && var.ssh_public_key != null ? 1 : 0
  key_name   = "${var.tenant_id}-key"
  public_key = var.ssh_public_key

  tags = local.common_tags
}

locals {
  resolved_key_name = var.ssh_key_name != null ? var.ssh_key_name : (length(aws_key_pair.tenant_key) > 0 ? aws_key_pair.tenant_key[0].key_name : null)
}

# 2. Instancia Frontend (Next.js SSR + Nginx Reverse Proxy + Bastion SSH)
resource "aws_instance" "frontend" {
  #checkov:skip=CKV_AWS_88:Frontend instance is intentionally public-facing as student web entrypoint
  ami                         = data.aws_ami.frontend.id
  instance_type               = local.selected_plan.frontend_type
  subnet_id                   = aws_subnet.frontend.id
  vpc_security_group_ids      = [aws_security_group.frontend.id]
  associate_public_ip_address = true
  key_name                    = local.resolved_key_name
  ebs_optimized               = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size           = local.selected_plan.disk_size_gb
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = merge(local.common_tags, {
      Name = "${var.tenant_id}-disk-frontend"
      Tier = "Frontend"
    })
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-frontend"
    Tier = "Frontend"
  })
}

# 3. Instancia Backend (NestJS API - Subred Privada sin IP Pública)
resource "aws_instance" "backend" {
  ami                         = data.aws_ami.backend.id
  instance_type               = local.selected_plan.backend_type
  subnet_id                   = aws_subnet.backend.id
  vpc_security_group_ids      = [aws_security_group.backend.id]
  associate_public_ip_address = false
  key_name                    = local.resolved_key_name
  ebs_optimized               = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size           = local.selected_plan.disk_size_gb
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = merge(local.common_tags, {
      Name = "${var.tenant_id}-disk-backend"
      Tier = "Backend"
    })
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-backend"
    Tier = "Backend"
  })
}

# 4. Instancia Database (PostgreSQL 16 - Subred Aislada sin IP Pública)
resource "aws_instance" "database" {
  ami                         = data.aws_ami.database.id
  instance_type               = local.selected_plan.db_type
  subnet_id                   = aws_subnet.database.id
  vpc_security_group_ids      = [aws_security_group.database.id]
  associate_public_ip_address = false
  key_name                    = local.resolved_key_name
  ebs_optimized               = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size           = local.selected_plan.disk_size_gb
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = merge(local.common_tags, {
      Name = "${var.tenant_id}-disk-database"
      Tier = "Database"
    })
  }

  tags = merge(local.common_tags, {
    Name = "${var.tenant_id}-database"
    Tier = "Database"
  })
}
