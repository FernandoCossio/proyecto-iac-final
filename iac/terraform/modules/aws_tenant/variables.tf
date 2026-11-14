# ==============================================================================
# Variables de entrada para el Módulo AWS Tenant
# ==============================================================================

variable "tenant_id" {
  type        = string
  description = "Identificador único del tenant (slug en minúsculas, ej: colegio-san-martin)."

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.tenant_id))
    error_message = "El tenant_id debe contener únicamente letras minúsculas, números y guiones."
  }
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Entorno de despliegue (dev, staging, prod)."
}

variable "aws_region" {
  type        = string
  default     = "us-east-2"
  description = "Región de AWS donde se aprovisionarán los recursos."
}

variable "plan" {
  type        = string
  default     = "basico"
  description = "Plan contratado por el tenant: 'basico', 'estandar' o 'avanzado'."

  validation {
    condition     = contains(["basico", "estandar", "avanzado"], var.plan)
    error_message = "El plan debe ser uno de los siguientes: 'basico', 'estandar' o 'avanzado'."
  }
}

variable "vpc_cidr" {
  type        = string
  default     = "10.10.0.0/16"
  description = "Bloque CIDR para la VPC dedicada del tenant."
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.10.1.0/24"
  description = "Bloque CIDR para la subred pública (Frontend / Bastion)."
}

variable "private_backend_subnet_cidr" {
  type        = string
  default     = "10.10.2.0/24"
  description = "Bloque CIDR para la subred privada del Backend NestJS."
}

variable "isolated_db_subnet_cidr" {
  type        = string
  default     = "10.10.3.0/24"
  description = "Bloque CIDR para la subred aislada de PostgreSQL 16."
}

variable "admin_ssh_ip" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Bloque CIDR de la IP del operador autorizada para acceder vía SSH al Frontend."
}

variable "ssh_key_name" {
  type        = string
  default     = null
  description = "Nombre de un KeyPair preexistente en AWS (opcional). Si es null, se usará ssh_public_key."
}

variable "ssh_public_key" {
  type        = string
  default     = null
  description = "Contenido de la llave pública OpenSSH si se desea que Terraform cree el KeyPair."
}

variable "ssh_private_key_path" {
  type        = string
  default     = "~/.ssh/iac-asistencia.pem"
  description = "Ruta local a la llave privada para el ProxyCommand de Ansible en el inventory.ini."
}

variable "inventory_output_dir" {
  type        = string
  default     = "../../../ansible/inventory"
  description = "Directorio destino relativo donde se generará el archivo inventory-<tenant_id>.ini."
}
