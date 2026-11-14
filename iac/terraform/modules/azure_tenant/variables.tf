# ==============================================================================
# Variables de entrada para el Módulo Azure Tenant
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

variable "azure_location" {
  type        = string
  default     = "eastus"
  description = "Región/Location de Azure (ej: eastus, brazilsouth)."
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

variable "vnet_address_space" {
  type        = string
  default     = "10.20.0.0/16"
  description = "Espacio de direcciones de la Virtual Network en Azure."
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.20.1.0/24"
  description = "Subred para Frontend público."
}

variable "private_backend_subnet_cidr" {
  type        = string
  default     = "10.20.2.0/24"
  description = "Subred para Backend NestJS."
}

variable "isolated_db_subnet_cidr" {
  type        = string
  default     = "10.20.3.0/24"
  description = "Subred para PostgreSQL 16."
}

variable "admin_ssh_ip" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR autorizado para acceso SSH a la IP pública del Frontend."
}

variable "ssh_public_key" {
  type        = string
  description = "Llave pública SSH para inyectar en las 3 VMs de Azure."
}

variable "ssh_private_key_path" {
  type        = string
  default     = "~/.ssh/id_rsa"
  description = "Ruta local a la llave privada para el ProxyCommand de Ansible."
}

variable "managed_image_resource_group" {
  type        = string
  default     = "rg-asistencia-images"
  description = "Resource Group donde residen las Managed Images de Packer."
}

variable "image_prefix" {
  type        = string
  default     = "asistencia"
  description = "Prefijo del nombre de las Managed Images creadas."
}

variable "app_version" {
  type        = string
  default     = "1.0.0"
  description = "Versión de las imágenes construidas."
}

variable "inventory_output_dir" {
  type        = string
  default     = "../../../ansible/inventory"
  description = "Directorio de salida relativo para inventory-<tenant_id>.ini."
}

variable "frontend_image_id" {
  type        = string
  default     = null
  description = "Resource ID de la Managed Image de Frontend en Azure (opcional, si no se especifica se busca por nombre en managed_image_resource_group)."
}

variable "backend_image_id" {
  type        = string
  default     = null
  description = "Resource ID de la Managed Image de Backend en Azure (opcional)."
}

variable "database_image_id" {
  type        = string
  default     = null
  description = "Resource ID de la Managed Image de Database en Azure (opcional)."
}
