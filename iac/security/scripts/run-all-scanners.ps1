<#
.SYNOPSIS
    Orquestador Central de Scanners DevSecOps para Infraestructura como Código (IaC).
.DESCRIPTION
    Ejecuta en secuencia:
    1. Gitleaks (Detección de Secretos)
    2. TFLint (Linting de Terraform y OpenTofu)
    3. cfn-lint (Validación de especificaciones AWS CloudFormation)
    4. Checkov (Auditoría de Seguridad y Cumplimiento CIS para Terraform, OpenTofu, CloudFormation y Ansible)
    5. Pulumi CrossGuard / Policy as Code (Pre-deploy compliance y TypeScript compilation)
#>

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> [DevSecOps] Iniciando Suite de Scanners de Seguridad" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$failed = $false

# 1. Gitleaks: Detección de Secretos
Write-Host "`n>>> [1/5] Escaneando Secretos con Gitleaks..." -ForegroundColor Yellow
try {
    gitleaks detect --source . --config .gitleaks.toml --verbose --no-git
    Write-Host "✅ Gitleaks: Cero secretos detectados." -ForegroundColor Green
} catch {
    Write-Host "❌ Gitleaks: Se detectaron posibles secretos en el repositorio." -ForegroundColor Red
    $failed = $true
}

# 2. TFLint: Linting de Terraform y OpenTofu
Write-Host "`n>>> [2/5] Ejecutando TFLint en módulos de Terraform y OpenTofu..." -ForegroundColor Yellow
try {
    tflint --chdir=iac/terraform --recursive
    tflint --chdir=iac/opentofu --recursive
    Write-Host "✅ TFLint: Sintaxis y reglas de providers conformes." -ForegroundColor Green
} catch {
    Write-Host "❌ TFLint: Se encontraron advertencias o errores en HCL." -ForegroundColor Red
    $failed = $true
}

# 3. cfn-lint: Validación de CloudFormation
Write-Host "`n>>> [3/5] Validando plantillas de CloudFormation con cfn-lint..." -ForegroundColor Yellow
try {
    cfn-lint iac/cloudformation/templates/*.yaml
    Write-Host "✅ cfn-lint: Plantillas conformes con especificaciones de AWS." -ForegroundColor Green
} catch {
    Write-Host "❌ cfn-lint: Se encontraron errores de sintaxis o propiedades inválidas en CloudFormation." -ForegroundColor Red
    $failed = $true
}

# 4. Checkov: Auditoría Integral de Seguridad (Terraform, OpenTofu, CloudFormation)
Write-Host "`n>>> [4/5] Analizando seguridad y cumplimiento con Checkov..." -ForegroundColor Yellow
try {
    checkov --config-file .checkov.yaml -d iac/terraform/modules/
    checkov --config-file .checkov.yaml -d iac/opentofu/modules/
    checkov --config-file .checkov.yaml -f iac/cloudformation/templates/tenant-stack.yaml
    if (Test-Path "iac/ansible") {
        checkov --config-file .checkov.yaml -d iac/ansible/ --framework ansible
    }
    Write-Host "✅ Checkov: Todas las pruebas de seguridad aprobadas." -ForegroundColor Green
} catch {
    Write-Host "❌ Checkov: Se detectaron fallas de seguridad en el código de infraestructura." -ForegroundColor Red
    $failed = $true
}

# 5. Pulumi: Validación de Código y Políticas
Write-Host "`n>>> [5/5] Compilando y validando proyecto Pulumi y Policy Pack..." -ForegroundColor Yellow
try {
    Push-Location iac/pulumi
    npm run build
    Pop-Location
    Push-Location iac/pulumi/policy-pack
    npm run build
    Pop-Location
    Write-Host "✅ Pulumi: TypeScript compilado sin errores y Policy Pack listo." -ForegroundColor Green
} catch {
    Write-Host "❌ Pulumi: Error en compilación de TypeScript o políticas." -ForegroundColor Red
    $failed = $true
    Pop-Location
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($failed) {
    Write-Host "❌ Quality Gate DevSecOps: Fallaron uno o más controles de seguridad." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Quality Gate DevSecOps: Todos los scanners pasaron exitosamente." -ForegroundColor Green
    exit 0
}
