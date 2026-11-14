param(
    [string]$StackName = "tenant-cfn-test",
    [string]$ParamFile = "$PSScriptRoot/../parameters/tenant-basico.json",
    [string]$AwsRegion = "us-east-2"
)

$ErrorActionPreference = "Stop"
$templateFile = "$PSScriptRoot/../templates/tenant-stack.yaml"

Write-Host "Desplegando stack '$StackName' con plantilla '$templateFile' en '$AwsRegion'..."

$params = Get-Content $ParamFile -Raw | ConvertFrom-Json
$overrides = @()
foreach ($p in $params) {
    $overrides += "$($p.ParameterKey)=$($p.ParameterValue)"
}

aws cloudformation deploy `
    --template-file $templateFile `
    --stack-name $StackName `
    --parameter-overrides $overrides `
    --region $AwsRegion `
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

Write-Host "Despliegue de CloudFormation finalizado exitosamente."
