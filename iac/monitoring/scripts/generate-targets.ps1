<#
.SYNOPSIS
    Genera archivos de targets para Prometheus (file_sd) a partir de los inventarios de Ansible.
.DESCRIPTION
    Lee los inventarios en iac/ansible/inventory/inventory-*.ini o toma parámetros directos
    para emitir un archivo JSON en iac/monitoring/targets/<tenant_id>.json.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$InventoryFile,

    [Parameter(Mandatory = $false)]
    [string]$TenantId,

    [Parameter(Mandatory = $false)]
    [string]$Plan = "estandar",

    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev",

    [Parameter(Mandatory = $false)]
    [string]$FrontendIp,

    [Parameter(Mandatory = $false)]
    [string]$BackendIp,

    [Parameter(Mandatory = $false)]
    [string]$DatabaseIp,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "$PSScriptRoot/../targets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

function Convert-InventoryToJson([string]$Path) {
    if (-not (Test-Path $Path)) {
        Write-Warning "No se encontró el inventario: $Path"
        return
    }

    $content = Get-Content -Path $Path -Raw
    
    $tenant = if ($content -match 'tenant_id\s*=\s*([a-zA-Z0-9_-]+)') { $Matches[1] } else { "tenant" }
    $env = if ($content -match 'environment\s*=\s*([a-zA-Z0-9_-]+)') { $Matches[1] } else { "dev" }
    
    $feIp = if ($content -match 'frontend-node\s+ansible_host=([^\s]+)') { $Matches[1] } else { $null }
    $beIp = if ($content -match 'backend-node\s+ansible_host=([^\s]+)') { $Matches[1] } else { $null }
    $dbIp = if ($content -match 'db-node\s+ansible_host=([^\s]+)') { $Matches[1] } else { $null }

    $targetsList = @()

    if ($feIp) {
        $targetsList += @{
            targets = @("${feIp}:9100")
            labels = @{
                tenant = $tenant
                plan = $Plan
                tier = "frontend"
                environment = $env
                role = "web-bastion"
            }
        }
    }

    if ($beIp) {
        $targetsList += @{
            targets = @("${beIp}:9100")
            labels = @{
                tenant = $tenant
                plan = $Plan
                tier = "backend"
                environment = $env
                role = "api"
            }
        }
    }

    if ($dbIp) {
        $targetsList += @{
            targets = @("${dbIp}:9100")
            labels = @{
                tenant = $tenant
                plan = $Plan
                tier = "database"
                environment = $env
                role = "postgres"
            }
        }
    }

    if ($targetsList.Count -gt 0) {
        $targetJsonPath = Join-Path $OutputDir "${tenant}.json"
        $targetsList | ConvertTo-Json -Depth 5 | Set-Content -Path $targetJsonPath -Encoding utf8
        Write-Host ">>> [OK] Target de Prometheus generado: $targetJsonPath" -ForegroundColor Green
    }
}

if ($InventoryFile) {
    Convert-InventoryToJson -Path $InventoryFile
} elseif ($FrontendIp -and $TenantId) {
    $targetsList = @()
    $targetsList += @{
        targets = @("${FrontendIp}:9100")
        labels = @{
            tenant = $TenantId
            plan = $Plan
            tier = "frontend"
            environment = $Environment
            role = "web-bastion"
        }
    }
    if ($BackendIp) {
        $targetsList += @{
            targets = @("${BackendIp}:9100")
            labels = @{
                tenant = $TenantId
                plan = $Plan
                tier = "backend"
                environment = $Environment
                role = "api"
            }
        }
    }
    if ($DatabaseIp) {
        $targetsList += @{
            targets = @("${DatabaseIp}:9100")
            labels = @{
                tenant = $TenantId
                plan = $Plan
                tier = "database"
                environment = $Environment
                role = "postgres"
            }
        }
    }
    $targetJsonPath = Join-Path $OutputDir "${TenantId}.json"
    $targetsList | ConvertTo-Json -Depth 5 | Set-Content -Path $targetJsonPath -Encoding utf8
    Write-Host ">>> [OK] Target de Prometheus generado para ${TenantId}: $targetJsonPath" -ForegroundColor Green
} else {
    # Escanear directorio de inventarios
    $inventoryDir = Join-Path $PSScriptRoot "../../ansible/inventory"
    $files = Get-ChildItem -Path $inventoryDir -Filter "inventory-*.ini" -ErrorAction SilentlyContinue
    if ($files.Count -eq 0) {
        Write-Host "No se encontraron inventarios en $inventoryDir. Generando target de ejemplo." -ForegroundColor Yellow
    } else {
        foreach ($f in $files) {
            Convert-InventoryToJson -Path $f.FullName
        }
    }
}
