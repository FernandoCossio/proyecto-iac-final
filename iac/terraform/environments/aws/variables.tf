# ==============================================================================
# Variables de Configuración para el Entorno AWS Tenant
# ==============================================================================

variable "tenant_id" {
  type        = string
  description = "Identificador único del tenant (slug en minúsculas)."

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
  description = "Región de AWS donde se desplegarán los recursos."
}

variable "plan" {
  type        = string
  default     = "basico"
  description = "Plan contratado: 'basico', 'estandar' o 'avanzado'."

  validation {
    condition     = contains(["basico", "estandar", "avanzado"], var.plan)
    error_message = "El plan debe ser: 'basico', 'estandar' o 'avanzado'."
  }
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "Bloque CIDR de la VPC del tenant."
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "Subred para Frontend público."
}

variable "private_backend_subnet_cidr" {
  type        = string
  default     = "10.0.2.0/24"
  description = "Subred para Backend NestJS."
}

variable "isolated_db_subnet_cidr" {
  type        = string
  default     = "10.0.3.0/24"
  description = "Subred para PostgreSQL 16."
}

variable "admin_ssh_ip" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Bloque CIDR autorizado para SSH en el Frontend."
}

variable "ssh_key_name" {
  type        = string
  default     = null
  description = "Nombre de un KeyPair preexistente en AWS."
}

variable "ssh_public_key" {
  type        = string
  default     = null
  description = "Contenido de la llave pública OpenSSH si se desea crear un KeyPair nuevo."
}

variable "ssh_private_key_path" {
  type        = string
  default     = "~/.ssh/iac-asistencia.pem"
  description = "Ruta local a la llave privada para el ProxyCommand de Ansible."
}

variable "inventory_output_dir" {
  type        = string
  default     = "../../../ansible/inventory"
  description = "Directorio destino relativo donde se generará el inventory-<tenant_id>.ini."
}
