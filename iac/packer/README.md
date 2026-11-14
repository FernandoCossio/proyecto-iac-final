# HashiCorp Packer: Golden Images para la Aplicación de Asistencia

Este directorio contiene las plantillas HCL2 y scripts de aprovisionamiento para construir **Golden Images inmutables** en **AWS (AMIs)** y **Azure (Managed Images)** para los 3 roles de la arquitectura de la aplicación:
1. `asistencia-frontend`: Ubuntu 22.04 LTS + Node.js 22 LTS + Nginx Reverse Proxy + `node_exporter`.
2. `asistencia-backend`: Ubuntu 22.04 LTS + Node.js 22 LTS + PM2 + Build Tools + `node_exporter`.
3. `asistencia-database`: Ubuntu 22.04 LTS + PostgreSQL 16 (PGDG oficial) + Tuning Cloud + `node_exporter`.

---

## Estructura

```text
iac/packer/
├── README.md
├── aws/
│   ├── frontend.pkr.hcl          # Builder amazon-ebs para frontend
│   ├── backend.pkr.hcl           # Builder amazon-ebs para backend
│   ├── database.pkr.hcl          # Builder amazon-ebs para database
│   ├── variables.pkr.hcl         # Declaración de variables (sin defaults hardcodeados)
│   └── vars.pkrvars.hcl.example  # Plantilla de ejemplo (el archivo real *.pkrvars.hcl está en .gitignore)
├── azure/
│   ├── frontend.pkr.hcl          # Builder azure-arm para frontend
│   ├── backend.pkr.hcl           # Builder azure-arm para backend
│   ├── database.pkr.hcl          # Builder azure-arm para database
│   ├── variables.pkr.hcl         # Declaración de variables (sin defaults hardcodeados)
│   └── vars.pkrvars.hcl.example  # Plantilla de ejemplo (el archivo real *.pkrvars.hcl está en .gitignore)
└── scripts/
    ├── setup-common.sh        # Aprovisionamiento base, herramientas y node_exporter
    ├── setup-frontend.sh      # Node.js 22, Nginx y configuración de proxy
    ├── setup-backend.sh       # Node.js 22, PM2 y herramientas de compilación
    ├── setup-database.sh      # PostgreSQL 16 PGDG, tuning y seguridad de red
    └── cleanup.sh             # Limpieza pre-snapshot (logs, cloud-init, keys)
```

---

## Requisitos Previos

- HashiCorp Packer v1.9.0 o superior instalado.
- Credenciales configuradas para el proveedor correspondiente:
  - **AWS:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` (o AWS CLI configurado vía `aws configure`).
  - **Azure:** `ARM_SUBSCRIPTION_ID`, `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`.

---

## Comandos de Ejecución

### 1. Construir AMIs en AWS

```bash
cd iac/packer/aws

# 1. Instalar plugins de Packer
packer init frontend.pkr.hcl

# 2. Validar sintaxis y configuración
packer validate -var-file=vars.pkrvars.hcl frontend.pkr.hcl
packer validate -var-file=vars.pkrvars.hcl backend.pkr.hcl
packer validate -var-file=vars.pkrvars.hcl database.pkr.hcl

# 3. Construir las imágenes
packer build -var-file=vars.pkrvars.hcl frontend.pkr.hcl
packer build -var-file=vars.pkrvars.hcl backend.pkr.hcl
packer build -var-file=vars.pkrvars.hcl database.pkr.hcl
```

### 2. Construir Managed Images en Azure

```bash
cd iac/packer/azure

# 1. Instalar plugins de Packer
packer init frontend.pkr.hcl

# 2. Validar sintaxis y configuración
packer validate -var-file=vars.pkrvars.hcl frontend.pkr.hcl
packer validate -var-file=vars.pkrvars.hcl backend.pkr.hcl
packer validate -var-file=vars.pkrvars.hcl database.pkr.hcl

# 3. Construir las imágenes
packer build -var-file=vars.pkrvars.hcl frontend.pkr.hcl
packer build -var-file=vars.pkrvars.hcl backend.pkr.hcl
packer build -var-file=vars.pkrvars.hcl database.pkr.hcl
```

---

## Convención de Tags y Consumo por IaC

Cada imagen generada contiene los siguientes tags de identificación para su localización automática mediante Data Sources en Terraform, OpenTofu, CloudFormation y Pulumi:

| Tag | Valor Ejemplo | Descripción |
|---|---|---|
| `Project` | `SistemaAsistencia` | Identificador del proyecto global |
| `Component` | `frontend` \| `backend` \| `database` | Rol especializado de la imagen |
| `Version` | `1.0.0` | Versión semántica del software |
| `ManagedBy` | `Packer` | Herramienta constructora |
| `OS` | `Ubuntu-22.04` | Sistema operativo base |
