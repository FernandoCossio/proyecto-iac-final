# ==============================================================================
# Descubrimiento Dinámico de AMIs Generadas con Packer
# ==============================================================================

data "aws_ami" "frontend" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "tag:Component"
    values = ["frontend"]
  }

  filter {
    name   = "tag:Project"
    values = ["SistemaAsistencia"]
  }
}

data "aws_ami" "backend" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "tag:Component"
    values = ["backend"]
  }

  filter {
    name   = "tag:Project"
    values = ["SistemaAsistencia"]
  }
}

data "aws_ami" "database" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "tag:Component"
    values = ["database"]
  }

  filter {
    name   = "tag:Project"
    values = ["SistemaAsistencia"]
  }
}
