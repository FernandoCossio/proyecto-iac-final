# ==============================================================================
# Variables de entrada para Azure Packer Templates
# ==============================================================================

variable "azure_subscription_id" {
  type        = string
  default     = env("ARM_SUBSCRIPTION_ID")
  description = "ID de la suscripción de Azure donde se desplegará la VM temporal y se guardará la Managed Image."
}

variable "azure_client_id" {
  type        = string
  default     = env("ARM_CLIENT_ID")
  description = "Application (Client) ID del Service Principal para autenticación en Azure."
}

variable "azure_client_secret" {
  type        = string
  default     = env("ARM_CLIENT_SECRET")
  sensitive   = true
  description = "Secret del Service Principal para autenticación en Azure."
}

variable "azure_tenant_id" {
  type        = string
  default     = env("ARM_TENANT_ID")
  description = "Directory (Tenant) ID de Microsoft Entra ID."
}

variable "azure_resource_group" {
  type        = string
  default     = "rg-asistencia-images"
  description = "Nombre del Resource Group donde se almacenarán las Managed Images generadas."
}

variable "azure_location" {
  type        = string
  default     = "eastus"
  description = "Región de Azure para el build y almacenamiento de la imagen (ej: eastus)."
}

variable "vm_size" {
  type        = string
  default     = "Standard_B1s"
  description = "Tamaño de la VM en Azure durante el proceso de build (compatible con Free Tier B1s)."
}

variable "image_prefix" {
  type        = string
  default     = "asistencia"
  description = "Prefijo para los nombres de las Managed Images creadas."
}

variable "app_version" {
  type        = string
  default     = "1.0.0"
  description = "Versión de la plataforma y del software instalado."
}

variable "ssh_username" {
  type        = string
  default     = "ubuntu"
  description = "Usuario SSH temporal para aprovisionar la máquina."
}
