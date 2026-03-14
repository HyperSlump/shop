param(
    [string]$EnvFile = ".env.local",
    [string]$Image = "stripe/stripe-cli:latest"
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

if ($stripeSecretKey -like "sk_live_*") {
    Write-Warning "You are using a live Stripe secret key. For local testing, use sk_test_*."
}

$webhookSecret = (& docker run --rm $Image listen --api-key $stripeSecretKey --print-secret).Trim()
if ([string]::IsNullOrWhiteSpace($webhookSecret) -or -not $webhookSecret.StartsWith("whsec_")) {
    throw "Could not retrieve a valid webhook secret from Stripe CLI"
}

if ($envContent -match "(?m)^\s*STRIPE_WEBHOOK_SECRET\s*=") {
    $updated = [regex]::Replace(
        $envContent,
        "(?m)^\s*STRIPE_WEBHOOK_SECRET\s*=.*$",
        "STRIPE_WEBHOOK_SECRET=$webhookSecret"
    )
} else {
    $suffix = if ($envContent.EndsWith("`n")) { "" } else { "`r`n" }
    $updated = $envContent + $suffix + "STRIPE_WEBHOOK_SECRET=$webhookSecret`r`n"
}

Set-Content -Path $EnvFile -Value $updated -NoNewline

Write-Output "Updated STRIPE_WEBHOOK_SECRET in $EnvFile"
Write-Output ("Webhook secret prefix: " + $webhookSecret.Substring(0, 8) + "...")
