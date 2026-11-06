param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [string]$DashboardUrl = "https://dev.azure.com/msazure/cognitive%20services/_componentGovernance/API-ImmersiveReader-Public-SDK-Deployment?_a=alerts&typeId=15563306&alerts-view-option=active",

    [int]$PipelineId = 247975
)

$ErrorActionPreference = "Stop"
Remove-Item -LiteralPath $OutputPath -Force -ErrorAction SilentlyContinue

function Set-WorkflowEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ($env:GITHUB_ENV) {
        "$Name=$Value" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
    }
}

function Invoke-GovernanceGet {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )

    return Invoke-RestMethod -Method Get -Headers $Headers -Uri $Uri
}

function Invoke-GovernancePagedGet {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )

    $items = @()
    $continuationToken = $null
    $pageCount = 0

    do {
        $pageCount++
        if ($pageCount -gt 100) {
            throw "Component Governance pagination exceeded 100 pages."
        }

        $pageUri = $Uri
        if ($continuationToken) {
            $separator = if ($pageUri.Contains("?")) { "&" } else { "?" }
            $pageUri += "$separator" + "continuationToken=$([Uri]::EscapeDataString($continuationToken))"
        }

        $response = Invoke-WebRequest -UseBasicParsing -Method Get -Headers $Headers -Uri $pageUri
        $body = $response.Content | ConvertFrom-Json
        if ($null -eq $body.value) {
            throw "A paged Component Governance response did not contain a value collection."
        }

        $items += @($body.value)
        $continuationToken = [string]$response.Headers["x-ms-continuationtoken"]
        if ([string]::IsNullOrWhiteSpace($continuationToken)) {
            $continuationToken = $null
        }
    } while ($continuationToken)

    return [pscustomobject]@{
        count = $items.Count
        value = $items
        pageCount = $pageCount
    }
}

try {
    $dashboardUri = [Uri]$DashboardUrl
    $segments = @($dashboardUri.AbsolutePath.Trim("/") -split "/")
    $hubIndex = [Array]::IndexOf($segments, "_componentGovernance")
    if ($hubIndex -lt 2 -or $segments.Count -le ($hubIndex + 1)) {
        throw "The dashboard URL does not identify an organization, project, and governed repository."
    }

    $organization = [Uri]::UnescapeDataString($segments[0])
    $project = [Uri]::UnescapeDataString($segments[$hubIndex - 1])
    $repositoryName = [Uri]::UnescapeDataString($segments[$hubIndex + 1])

    if ($env:ADO_GOVERNANCE_BEARER_TOKEN) {
        $headers = @{ Authorization = "Bearer $($env:ADO_GOVERNANCE_BEARER_TOKEN)" }
    }
    elseif ($env:ADO_MCP_PAT_B64) {
        $headers = @{ Authorization = "Basic $($env:ADO_MCP_PAT_B64)" }
    }
    else {
        throw "Neither ADO_MCP_PAT_B64 nor ADO_GOVERNANCE_BEARER_TOKEN is available."
    }

    $serviceRoot = "https://governance.dev.azure.com/$([Uri]::EscapeDataString($organization))"
    $encodedProject = [Uri]::EscapeDataString($project)
    $encodedRepositoryName = [Uri]::EscapeDataString($repositoryName)
    $apiVersion = "5.0-preview.1"

    $repositoryUri = "$serviceRoot/$encodedProject/_apis/ComponentGovernance/GovernedRepositories/$encodedRepositoryName" +
        "?api-version=$apiVersion"
    $repository = Invoke-GovernanceGet -Uri $repositoryUri -Headers $headers
    if (-not $repository.id -or $repository.name -ne $repositoryName) {
        throw "The governed repository resolved from the dashboard URL did not match '$repositoryName'."
    }

    $snapshotTypesUri = "$serviceRoot/$encodedProject/_apis/ComponentGovernance/GovernedRepositories/$($repository.id)/SnapshotTypes" +
        "?api-version=$apiVersion"
    $snapshotTypes = Invoke-GovernancePagedGet -Uri $snapshotTypesUri -Headers $headers
    $pipelineMarker = "/$PipelineId/"
    $productionSnapshots = @(
        $snapshotTypes.value |
            Where-Object {
                $_.buildType -like "*$pipelineMarker*" -and
                $_.externalTrackingState -in @("production", "productionByPolicy")
            } |
            Sort-Object -Property @{ Expression = { [DateTime]$_.latestScanDate }; Descending = $true }
    )

    if ($productionSnapshots.Count -eq 0) {
        throw "No production Component Governance snapshot was found for pipeline $PipelineId."
    }

    $snapshot = $productionSnapshots[0]
    $alertsUri = "$serviceRoot/$encodedProject/_apis/ComponentGovernance/GovernedRepositories/$($repository.id)/Alerts" +
        "?api-version=$apiVersion&snapshotTypeId=$($snapshot.typeId)&alertState=Active&includeDevelopmentDependencies=true"
    $alertsResponse = Invoke-GovernancePagedGet -Uri $alertsUri -Headers $headers
    $alerts = @(
        $alertsResponse.value |
            Where-Object { $_.type -eq "security" -and $_.alertState -eq "active" } |
            Sort-Object -Property id |
            ForEach-Object {
                [ordered]@{
                    alertId = [string]$_.id
                    key = $_.key
                    title = $_.title
                    severity = $_.severity
                    alertState = $_.alertState
                    discoveredDate = $_.discoveredDate
                    registrationId = $_.registrationId
                    component = $_.component
                    registrationMetadata = $_.registrationMetadata
                    advisorySources = $_.sources
                    identifiers = $_.additionalProperties.identifiers
                }
            }
    )

    $payload = [ordered]@{
        schemaVersion = 1
        queriedAtUtc = [DateTime]::UtcNow.ToString("o")
        dashboardUrl = $DashboardUrl
        organization = $organization
        project = $project
        pipelineId = $PipelineId
        governedRepository = [ordered]@{
            id = $repository.id
            name = $repository.name
        }
        snapshot = [ordered]@{
            typeId = $snapshot.typeId
            buildType = $snapshot.buildType
            buildDisplayType = $snapshot.buildDisplayType
            sourceType = $snapshot.sourceType
            sourceDisplayType = $snapshot.sourceDisplayType
            externalTrackingState = $snapshot.externalTrackingState
            latestScanDate = $snapshot.latestScanDate
        }
        snapshotTypePageCount = $snapshotTypes.pageCount
        alertPageCount = $alertsResponse.pageCount
        activeSecurityAlertCount = $alerts.Count
        alerts = $alerts
    }

    $outputDirectory = Split-Path -Parent $OutputPath
    if ($outputDirectory) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }
    $payload | ConvertTo-Json -Depth 20 | Set-Content -Path $OutputPath -Encoding utf8

    Set-WorkflowEnvironment -Name "CG_LIVE_ALERTS_STATUS" -Value "available"
    Set-WorkflowEnvironment -Name "CG_LIVE_ALERTS_PATH" -Value $OutputPath
    Set-WorkflowEnvironment -Name "CG_LIVE_ALERT_COUNT" -Value ([string]$alerts.Count)
    Set-WorkflowEnvironment -Name "CG_LIVE_SNAPSHOT_TYPE_ID" -Value ([string]$snapshot.typeId)
    Write-Host "Read $($snapshotTypes.count) snapshot types across $($snapshotTypes.pageCount) page(s)."
    Write-Host "Read $($alerts.Count) active security alerts across $($alertsResponse.pageCount) page(s) from production snapshot $($snapshot.typeId)."
}
catch {
    Set-WorkflowEnvironment -Name "CG_LIVE_ALERTS_STATUS" -Value "unavailable"
    Write-Error "The live Component Governance preflight failed: $($_.Exception.Message)" -ErrorAction Continue
    Write-Warning "The remediation agent must stop without creating a pull request."
}
