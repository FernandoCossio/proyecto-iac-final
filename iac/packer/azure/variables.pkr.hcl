# ==============================================================================
# Variables de entrada para Azure Packer Templates (Parametrización Estricta)
# ==============================================================================

packer {
  required_plugins {
    azure = {
      version = ">= 2.1.0"
      source  = "github.com/hashicorp/azure"
    }
  }
}

variable "use_azure_cli_auth" {
  type        = bool
  default     = true
  description = "Indica si se utiliza la sesión activa de Azure CLI para autenticación."
}

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
  description = "Nombre del Resource Group donde se almacenarán las Managed Images generadas."
}

variable "azure_location" {
  type        = string
  description = "Región/Location de Azure para el build y almacenamiento de la imagen (ej: eastus, brazilsouth)."
}

variable "vm_size" {
  type        = string
  description = "Tamaño de la VM en Azure durante el proceso de build (ej: Standard_B1s)."
}

variable "image_prefix" {
  type        = string
  description = "Prefijo para los nombres de las Managed Images creadas (ej: asistencia)."
}

variable "app_version" {
  type        = string
  description = "Versión semántica de la plataforma y del software instalado."
}

variable "ssh_username" {
  type        = string
  description = "Usuario SSH temporal para aprovisionar la máquina (ej: ubuntu)."
}
