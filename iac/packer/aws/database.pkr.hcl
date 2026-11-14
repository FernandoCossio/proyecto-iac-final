# ==============================================================================
# Packer Template: AWS AMI para 'asistencia-database'
# Componentes: Ubuntu 22.04 LTS, PostgreSQL 16 PGDG, Tuning Base, node_exporter
# ==============================================================================

packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "database" {
  ami_name      = "${var.image_prefix}-database-${var.app_version}-{{timestamp}}"
  instance_type = var.instance_type
  region        = var.aws_region
  ssh_username  = var.ssh_username

  source_ami_filter {
    filters = {
      name                = var.source_ami_filter_name
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = [var.source_ami_owner]
  }

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 10
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name        = "${var.image_prefix}-database-${var.app_version}"
    Project     = "SistemaAsistencia"
    Component   = "database"
    Version     = var.app_version
    ManagedBy   = "Packer"
    OS          = "Ubuntu-22.04"
  }
}

build {
  name    = "asistencia-database"
  sources = ["source.amazon-ebs.database"]

  provisioner "shell" {
    scripts = [
      "${path.root}/../scripts/setup-common.sh",
      "${path.root}/../scripts/setup-database.sh",
      "${path.root}/../scripts/cleanup.sh"
    ]
  }
}
