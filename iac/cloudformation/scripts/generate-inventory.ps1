param(
    [Parameter(Mandatory=$true)]
    [string]$StackName,

    [Parameter(Mandatory=$true)]
    [string]$SshKeyPath,

    [string]$AwsRegion = "us-east-2",
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

if (-not $OutputDir) {
    $OutputDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../../ansible/inventory"))
} else {
    $OutputDir = [System.IO.Path]::GetFullPath($OutputDir)
}

Write-Host "Consultando outputs del stack '$StackName' en region '$AwsRegion'..."
$rawOutputs = aws cloudformation describe-stacks --stack-name $StackName --region $AwsRegion --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

$outputsDict = @{}
foreach ($item in $rawOutputs) {
    $outputsDict[$item.OutputKey] = $item.OutputValue
}

$tenantId   = $outputsDict["TenantId"]
$frontendIp = $outputsDict["FrontendPublicIp"]
$backendIp  = $outputsDict["BackendPrivateIp"]
$dbIp       = $outputsDict["DatabasePrivateIp"]

if (-not $tenantId -or -not $frontendIp) {
    throw "Error: No se pudieron extraer los outputs necesarios del stack '$StackName'."
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$inventoryFile = Join-Path $OutputDir "inventory-$tenantId.ini"

$content = @"
# ==============================================================================
# Inventario Dinamico de Ansible generado por AWS CloudFormation
# Tenant: $tenantId | Stack: $StackName
# ==============================================================================

[frontend]
frontend-node ansible_host=$frontendIp ansible_user=ubuntu ansible_ssh_private_key_file=$SshKeyPath

[backend]
backend-node ansible_host=$backendIp ansible_user=ubuntu ansible_ssh_private_key_file=$SshKeyPath ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@$frontendIp -i $SshKeyPath -o StrictHostKeyChecking=no"'

[database]
db-node ansible_host=$dbIp ansible_user=ubuntu ansible_ssh_private_key_file=$SshKeyPath ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@$frontendIp -i $SshKeyPath -o StrictHostKeyChecking=no"'

[all:vars]
tenant_id=$tenantId
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
"@

Set-Content -Path $inventoryFile -Value $content -Encoding utf8
Write-Host "Inventario generado exitosamente en: $inventoryFile"
