# ==============================================================================
# Variables de entrada para AWS Packer Templates
# ==============================================================================

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Región de AWS donde se construirá la AMI y se almacenará el snapshot."
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "Tipo de instancia EC2 utilizada para el proceso de build (compatible con Free Tier)."
}

variable "image_prefix" {
  type        = string
  default     = "asistencia"
  description = "Prefijo para el nombre de las AMIs generadas."
}

variable "app_version" {
  type        = string
  default     = "1.0.0"
  description = "Versión de la plataforma y de los artefactos de software horneados."
}

variable "source_ami_owner" {
  type        = string
  default     = "099720109477" # Canonical official account
  description = "ID de la cuenta de AWS propietaria de las AMIs base de Ubuntu."
}

variable "source_ami_filter_name" {
  type        = string
  default     = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
  description = "Patrón de búsqueda para la AMI oficial más reciente de Ubuntu 22.04 LTS."
}

variable "ssh_username" {
  type        = string
  default     = "ubuntu"
  description = "Usuario SSH estándar para conectarse durante el aprovisionamiento de Ubuntu."
}
