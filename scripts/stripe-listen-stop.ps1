param(
    [string]$ContainerName = "stripe-cli-listener"
)

$ErrorActionPreference = "Stop"

$existingRaw = & docker ps -aq --filter "name=^${ContainerName}$"
$existing = [string]::Join("", @($existingRaw)).Trim()
if (-not $existing) {
    Write-Output "No Stripe listener container found with name: $ContainerName"
    exit 0
}

& docker rm -f $ContainerName | Out-Null
Write-Output "Stopped Stripe listener container: $ContainerName"
