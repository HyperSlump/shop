param(
    [string]$EnvFile = ".env.local",
    [string]$ContainerName = "stripe-cli-listener",
    [string]$Image = "stripe/stripe-cli:latest",
    [string]$ForwardTo = "http://host.docker.internal:3000/api/webhook",
    [string]$Events = "payment_intent.succeeded,checkout.session.completed"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
    throw "Env file not found: $EnvFile"
}

$envContent = Get-Content -Raw $EnvFile
$secretMatch = [regex]::Match($envContent, "(?m)^\s*STRIPE_SECRET_KEY\s*=\s*(.+)\s*$")
if (-not $secretMatch.Success) {
    throw "STRIPE_SECRET_KEY is missing in $EnvFile"
}

$stripeSecretKey = $secretMatch.Groups[1].Value.Trim()
if ([string]::IsNullOrWhiteSpace($stripeSecretKey)) {
    throw "STRIPE_SECRET_KEY is empty in $EnvFile"
}

$existingRaw = & docker ps -aq --filter "name=^${ContainerName}$"
$existing = [string]::Join("", @($existingRaw)).Trim()
if ($existing) {
    & docker rm -f $ContainerName | Out-Null
}

$commonArgs = @(
    "run",
    "--name", $ContainerName,
    "--rm",
    "-d",
    $Image,
    "listen",
    "--api-key", $stripeSecretKey,
    "--events", $Events,
    "--forward-to", $ForwardTo
)

# host.docker.internal mapping for Linux Docker engines; harmless where already supported.
$runArgsWithHost = @("run", "--name", $ContainerName, "--rm", "-d", "--add-host", "host.docker.internal:host-gateway") +
    @($Image, "listen", "--api-key", $stripeSecretKey, "--events", $Events, "--forward-to", $ForwardTo)

& docker @runArgsWithHost *> $null
if ($LASTEXITCODE -ne 0) {
    & docker @commonArgs *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start Stripe CLI listener container"
    }
}

Start-Sleep -Seconds 1

Write-Output "Stripe CLI listener is running in Docker container: $ContainerName"
Write-Output "Forwarding events: $Events"
Write-Output "Forwarding to: $ForwardTo"
Write-Output ""
Write-Output "Recent logs:"
& docker logs --tail 20 $ContainerName
