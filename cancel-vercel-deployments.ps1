param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [int]$DelayMs = 300
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type"  = "application/json"
}

Write-Host "Fetching all deployments..." -ForegroundColor Cyan

$allDeployments = @()
$next = $null

do {
    $url = "https://api.vercel.com/v6/deployments?limit=100"
    if ($next) { $url = $url + "&until=" + $next }

    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    $allDeployments += $response.deployments
    $next = $response.pagination.next
} while ($next)

if ($allDeployments.Count -eq 0) {
    Write-Host "No deployments found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($allDeployments.Count) deployment(s). Deleting with ${DelayMs}ms delay..." -ForegroundColor Yellow

$success = 0
$failed  = 0
$retryList = @()

foreach ($dep in $allDeployments) {
    $id        = $dep.uid
    $name      = $dep.name
    $deleteUrl = "https://api.vercel.com/v13/deployments/$id"

    $deleted = $false
    $attempts = 0

    while (-not $deleted -and $attempts -lt 5) {
        $attempts++
        try {
            Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method DELETE | Out-Null
            Write-Host "  DELETED: $name ($id)" -ForegroundColor Green
            $success++
            $deleted = $true
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 429) {
                $wait = $DelayMs * $attempts * 3
                Write-Host "  RATE LIMITED - waiting ${wait}ms then retrying... ($name)" -ForegroundColor Yellow
                Start-Sleep -Milliseconds $wait
            } elseif ($statusCode -eq 403) {
                Write-Host "  SKIP (protected/active): $name ($id)" -ForegroundColor Gray
                $deleted = $true
            } else {
                Write-Host "  FAIL: $name ($id) - $($_.Exception.Message)" -ForegroundColor Red
                $failed++
                $deleted = $true
            }
        }
    }

    if (-not $deleted) {
        Write-Host "  GAVE UP: $name ($id)" -ForegroundColor Red
        $failed++
    }

    Start-Sleep -Milliseconds $DelayMs
}

Write-Host ""
Write-Host "Done! $success deleted, $failed failed" -ForegroundColor Cyan
