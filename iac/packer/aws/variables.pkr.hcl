# ==============================================================================
# Variables de entrada para AWS Packer Templates (Parametrización Estricta)
# ==============================================================================

variable "aws_region" {
  type        = string
  description = "Región de AWS donde se construirá la AMI y se almacenará el snapshot."
}

variable "instance_type" {
  type        = string
  description = "Tipo de instancia EC2 utilizada para el proceso de build (ej: t3.micro)."
}

variable "image_prefix" {
  type        = string
  description = "Prefijo para el nombre de las AMIs generadas (ej: asistencia)."
}

variable "app_version" {
  type        = string
  description = "Versión semántica de la plataforma y de los artefactos de software horneados."
}

variable "source_ami_owner" {
  type        = string
  description = "ID de la cuenta de AWS propietaria de las AMIs base (ej: 099720109477 para Canonical)."
}

variable "source_ami_filter_name" {
  type        = string
  description = "Patrón de búsqueda para la AMI oficial base de Ubuntu 22.04 LTS."
}

variable "ssh_username" {
  type        = string
  description = "Usuario SSH estándar para conectarse durante el aprovisionamiento (ej: ubuntu)."
}
