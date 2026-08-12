param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [int]$Threads = 5
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

Write-Host "Found $($allDeployments.Count) deployment(s). Deleting with $Threads parallel threads..." -ForegroundColor Yellow

$ids = $allDeployments | ForEach-Object { @{ uid = $_.uid; name = $_.name } }

$scriptBlock = {
    param($dep, $token)
    $id   = $dep.uid
    $name = $dep.name
    $url  = "https://api.vercel.com/v13/deployments/$id"
    $hdrs = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

    $attempts = 0
    while ($attempts -lt 6) {
        $attempts++
        try {
            Invoke-RestMethod -Uri $url -Headers $hdrs -Method DELETE | Out-Null
            return "DELETED: $name ($id)"
        } catch {
            $code = $_.Exception.Response.StatusCode.value__
            if ($code -eq 429) {
                Start-Sleep -Milliseconds (1000 * $attempts)
            } elseif ($code -eq 403 -or $code -eq 404) {
                return "SKIP: $name ($id)"
            } else {
                return "FAIL: $name ($id) [$code]"
            }
        }
    }
    return "GAVE UP: $name ($id)"
}

$jobs = @()
$index = 0

while ($index -lt $ids.Count -or $jobs.Count -gt 0) {
    while ($jobs.Count -lt $Threads -and $index -lt $ids.Count) {
        $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $ids[$index], $Token
        $index++
    }

    $done = $jobs | Where-Object { $_.State -ne 'Running' }
    foreach ($job in $done) {
        $result = Receive-Job -Job $job
        if ($result -match "^DELETED") {
            Write-Host "  $result" -ForegroundColor Green
        } elseif ($result -match "^SKIP") {
            Write-Host "  $result" -ForegroundColor Gray
        } else {
            Write-Host "  $result" -ForegroundColor Red
        }
        Remove-Job -Job $job
        $jobs = $jobs | Where-Object { $_.Id -ne $job.Id }
    }

    if ($jobs.Count -ge $Threads) {
        Start-Sleep -Milliseconds 200
    }
}

Write-Host ""
Write-Host "All done!" -ForegroundColor Cyan
