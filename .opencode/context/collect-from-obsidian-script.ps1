# collect-from-obsidian.ps1 - Read metrics from Obsidian and update baseline
# Run by Task Scheduler at 22:05 daily

$obsidianPath = "D:\Dev\tools\DBObsidian\resume-app"
$logsPath = "D:\Dev\projects\resume\.opencode\logs"
$metricsPath = "$logsPath\metrics"
$baselinePath = "$logsPath\baseline-metrics.json"
$today = Get-Date -Format "yyyy-MM-dd"
$outputFile = "$metricsPath\daily-$today.json"
$agentStatsFile = "$metricsPath\agents-$today.json"

Write-Host "[obsidian-collect] Starting for $today" -ForegroundColor Cyan

try {
    if (!(Test-Path $metricsPath)) {
        New-Item -ItemType Directory -Force -Path $metricsPath | Out-Null
    }

    # Search for today's metrics in Obsidian
    $todayFile = Get-ChildItem "$obsidianPath\logs" -Filter "metrics-$today.md" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    $totalTokens = 0
    $totalRequests = 0
    $agentStats = @{}
    
    if ($todayFile) {
        $content = Get-Content $todayFile.FullName -Raw
        
        # Extract all entries
        $entries = [regex]::Matches($content, '##\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\n\s*-\s*\*\*Agent:\*\*\s*(\S+)\s*\n\s*-\s*\*\*Model:\*\*\s*(\S+)\s*\n\s*-\s*\*\*Tokens:\*\*\s*(\d+)')
        
        foreach ($entry in $entries) {
            $timestamp = $entry.Groups[1].Value
            $agent = $entry.Groups[2].Value
            $model = $entry.Groups[3].Value
            $tokens = [int]$entry.Groups[4].Value
            
            $totalTokens += $tokens
            $totalRequests++
            
            # Track per-agent stats
            if (!$agentStats.ContainsKey($agent)) {
                $agentStats[$agent] = @{tokens = 0; requests = 0}
            }
            $agentStats[$agent].tokens += $tokens
            $agentStats[$agent].requests++
        }
        
        Write-Host "[obsidian-collect] Found $totalRequests agent calls, $totalTokens tokens" -ForegroundColor Gray
    }
    
    $avgTokens = if ($totalRequests -gt 0) { [math]::Round($totalTokens / $totalRequests, 2) } else { 0 }
    
    # Save daily metrics
    $metrics = @{
        date = $today
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        totalTokens = $totalTokens
        totalRequests = $totalRequests
        avgTokensPerRequest = $avgTokens
        source = "obsidian"
        status = "collected"
    }
    
    $metrics | ConvertTo-Json | Out-File $outputFile -Encoding UTF8
    Write-Host "[obsidian-collect] Saved: $outputFile" -ForegroundColor Green
    
    # Save agent statistics
    if ($agentStats.Count -gt 0) {
        $agentStats | ConvertTo-Json -Depth 5 | Out-File $agentStatsFile -Encoding UTF8
        Write-Host "[obsidian-collect] Agent stats saved: $agentStatsFile" -ForegroundColor Green
        
        # Show top agents
        Write-Host "`n[obsidian-collect] Top agents by token usage:" -ForegroundColor Yellow
        $agentStats.GetEnumerator() | Sort-Object { $_.Value.tokens } -Descending | Select-Object -First 5 | ForEach-Object {
            Write-Host "  $($_.Key): $($_.Value.tokens) tokens, $($_.Value.requests) requests" -ForegroundColor Gray
        }
    }
    
    # Update baseline
    if (Test-Path $baselinePath) {
        $baseline = Get-Content $baselinePath | ConvertFrom-Json
        
        if ($baseline.status -eq "collecting") {
            $baseline.dailyMetrics += $metrics
            $baseline.measurementPeriod.daysCollected = $baseline.dailyMetrics.Count
            $baseline.measurementPeriod.tasksSampled += $totalRequests
            
            if ($baseline.measurementPeriod.daysCollected -ge 7) {
                $baseline.status = "completed"
                $baseline.measurementPeriod.end = $today
                $avgBaseline = [math]::Round(($baseline.dailyMetrics | Measure-Object -Property totalTokens -Average).Average, 2)
                $baseline.baseline.avgTokensPerTask = $avgBaseline
                Write-Host "[obsidian-collect] Baseline completed! Avg: $avgBaseline tokens/request" -ForegroundColor Green
            }
            
            $baseline | ConvertTo-Json -Depth 10 | Out-File $baselinePath -Encoding UTF8
            Write-Host "[obsidian-collect] Baseline updated (Day $($baseline.measurementPeriod.daysCollected)/7)" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "[obsidian-collect] Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[obsidian-collect] Completed" -ForegroundColor Cyan
