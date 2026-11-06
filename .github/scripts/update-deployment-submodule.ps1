param(
    [string]$AdoOrganization = "msazure",

    [string]$AdoProject = "Cognitive Services",

    [string]$AdoRepository = "API-ImmersiveReader-Public-SDK-Deployment",

    [string]$AdoTargetBranch = "main",

    [string]$GitHubRepository = "microsoft/immersive-reader-sdk",

    [string]$GitHubBranch = "master",

    [string]$RequiredPullRequestTitlePrefix = "[Component Governance] ",

    [Parameter(Mandatory = $true)]
    [ValidateRange(1, [int]::MaxValue)]
    [int]$MergedPullRequestNumber,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $stderrPath = [IO.Path]::GetTempFileName()
    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $output = & git -C $WorkingDirectory @Arguments 2> $stderrPath
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
        $stderrOutput = @(Get-Content -LiteralPath $stderrPath -ErrorAction SilentlyContinue)
        Remove-Item -LiteralPath $stderrPath -Force -ErrorAction SilentlyContinue
    }

    if ($exitCode -ne 0) {
        $errorOutput = @($output) + $stderrOutput
        throw "git $($Arguments -join ' ') failed: $($errorOutput -join [Environment]::NewLine)"
    }

    return $output
}

function Get-GitHubHeaders {
    $headers = @{
        Accept = "application/vnd.github+json"
        "User-Agent" = "immersive-reader-sdk-deployment-updater"
        "X-GitHub-Api-Version" = "2022-11-28"
    }

    if ($env:GITHUB_TOKEN) {
        $headers.Authorization = "Bearer $($env:GITHUB_TOKEN)"
    }

    return $headers
}

if (-not $env:ADO_MCP_PAT_B64) {
    throw "ADO_MCP_PAT_B64 is required to read and update the Azure DevOps repository."
}

$adoHeaders = @{
    Authorization = "Basic $($env:ADO_MCP_PAT_B64)"
    Accept = "application/json"
}
$githubHeaders = Get-GitHubHeaders
$encodedProject = [Uri]::EscapeDataString($AdoProject)
$encodedRepository = [Uri]::EscapeDataString($AdoRepository)
$encodedTargetRef = [Uri]::EscapeDataString("refs/heads/$AdoTargetBranch")
$adoRepositoryUrl = "https://dev.azure.com/$AdoOrganization/$encodedProject/_git/$encodedRepository"
$adoApiBase = "https://dev.azure.com/$AdoOrganization/$encodedProject/_apis/git/repositories/$encodedRepository"
$githubRepositoryUrl = "https://github.com/$GitHubRepository.git"
$githubApiBase = "https://api.github.com/repos/$GitHubRepository"
$automationBranchPrefix = "automation/update-immersive-reader-sdk-"

$mergedPullRequest = Invoke-RestMethod `
    -Method Get `
    -Headers $githubHeaders `
    -Uri "$githubApiBase/pulls/$MergedPullRequestNumber"

if (-not $mergedPullRequest.merged_at) {
    throw "GitHub PR #$MergedPullRequestNumber is not merged."
}
if ($mergedPullRequest.base.ref -ne $GitHubBranch) {
    throw "GitHub PR #$MergedPullRequestNumber targeted '$($mergedPullRequest.base.ref)', not '$GitHubBranch'."
}
if (-not $mergedPullRequest.title.StartsWith(
    $RequiredPullRequestTitlePrefix,
    [StringComparison]::Ordinal
)) {
    throw "GitHub PR #$MergedPullRequestNumber does not have the required title prefix '$RequiredPullRequestTitlePrefix'."
}

$pullRequestsUri = "$adoApiBase/pullrequests" +
    "?searchCriteria.status=active" +
    "&searchCriteria.targetRefName=$encodedTargetRef" +
    "&`$top=100" +
    "&api-version=7.1"
$activePullRequests = @((Invoke-RestMethod -Method Get -Headers $adoHeaders -Uri $pullRequestsUri).value)
$automationPullRequests = @(
    $activePullRequests |
        Where-Object { $_.sourceRefName -like "refs/heads/$automationBranchPrefix*" }
)
$manualSubmodulePullRequests = @(
    $activePullRequests |
        Where-Object {
            $_.title -like "Update immersive-reader-sdk submodule*" -and
            $_.sourceRefName -notlike "refs/heads/$automationBranchPrefix*"
        }
)

if ($automationPullRequests.Count -gt 1) {
    throw "More than one active automated submodule pull request targets ADO '$AdoTargetBranch'."
}
if ($manualSubmodulePullRequests.Count -gt 0) {
    Write-Host "An active manually-created submodule update PR already targets ADO '$AdoTargetBranch'. No duplicate PR will be created."
    return
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) "immersive-reader-sdk-submodule-$([Guid]::NewGuid().ToString('N'))"
$deploymentDirectory = Join-Path $tempRoot "deployment"
$sdkDirectory = Join-Path $tempRoot "sdk"

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null

    $env:GIT_CONFIG_COUNT = "1"
    $env:GIT_CONFIG_KEY_0 = "http.https://dev.azure.com/$AdoOrganization/.extraheader"
    $env:GIT_CONFIG_VALUE_0 = "AUTHORIZATION: Basic $($env:ADO_MCP_PAT_B64)"

    Invoke-Git -WorkingDirectory $tempRoot -Arguments @(
        "clone",
        "--filter=blob:none",
        "--no-checkout",
        "--branch",
        $AdoTargetBranch,
        $adoRepositoryUrl,
        $deploymentDirectory
    ) | Out-Host
    Invoke-Git -WorkingDirectory $tempRoot -Arguments @(
        "clone",
        "--filter=blob:none",
        "--no-checkout",
        "--single-branch",
        "--branch",
        $GitHubBranch,
        $githubRepositoryUrl,
        $sdkDirectory
    ) | Out-Host

    $targetSdkCommit = ([string](Invoke-Git -WorkingDirectory $sdkDirectory -Arguments @(
        "rev-parse",
        "origin/$GitHubBranch"
    ))).Trim()
    $submoduleEntry = ([string](Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "ls-tree",
        "origin/$AdoTargetBranch",
        "immersive-reader-sdk"
    ))).Trim()

    if ($submoduleEntry -notmatch "^160000 commit ([0-9a-f]{40})`timmersive-reader-sdk$") {
        throw "ADO '$AdoTargetBranch' does not contain the expected immersive-reader-sdk gitlink."
    }

    $currentSdkCommit = $Matches[1]
    if ($currentSdkCommit -eq $targetSdkCommit) {
        Write-Host "ADO '$AdoTargetBranch' already points to GitHub '$GitHubBranch' commit $targetSdkCommit."
        return
    }

    & git -C $sdkDirectory merge-base --is-ancestor $currentSdkCommit $targetSdkCommit
    if ($LASTEXITCODE -eq 1) {
        throw "The ADO submodule pointer $currentSdkCommit is not an ancestor of GitHub '$GitHubBranch' commit $targetSdkCommit."
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to verify the GitHub commit ancestry."
    }

    & git -C $sdkDirectory merge-base --is-ancestor $mergedPullRequest.merge_commit_sha $targetSdkCommit
    if ($LASTEXITCODE -eq 1) {
        throw "The merge commit for GitHub PR #$MergedPullRequestNumber is not present on '$GitHubBranch'."
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to verify the merged GitHub pull request commit."
    }

    if ($automationPullRequests.Count -eq 1) {
        $adoPullRequest = $automationPullRequests[0]
        $sourceBranch = $adoPullRequest.sourceRefName -replace "^refs/heads/", ""
        Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
            "fetch",
            "origin",
            $sourceBranch
        ) | Out-Host
        Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
            "checkout",
            "-b",
            $sourceBranch,
            "FETCH_HEAD"
        ) | Out-Host
    }
    else {
        $sourceBranch = "$automationBranchPrefix$($targetSdkCommit.Substring(0, 12))"
        $remoteBranch = @(
            Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
                "ls-remote",
                "--heads",
                "origin",
                "refs/heads/$sourceBranch"
            )
        )
        if ($remoteBranch.Count -gt 0) {
            Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
                "fetch",
                "origin",
                $sourceBranch
            ) | Out-Host
            Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
                "checkout",
                "-b",
                $sourceBranch,
                "FETCH_HEAD"
            ) | Out-Host
        }
        else {
            Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
                "checkout",
                "-b",
                $sourceBranch,
                "origin/$AdoTargetBranch"
            ) | Out-Host
        }
    }

    if ($automationPullRequests.Count -eq 1 -or $remoteBranch.Count -gt 0) {
        $changedFiles = @(
            Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
                "diff",
                "--name-only",
                "origin/$AdoTargetBranch...HEAD"
            )
        )
        $unexpectedFiles = @($changedFiles | Where-Object { $_ -and $_ -ne "immersive-reader-sdk" })
        if ($unexpectedFiles.Count -gt 0) {
            throw "The existing automated ADO branch contains unexpected files: $($unexpectedFiles -join ', ')."
        }
    }

    $gitmodulesUrl = ([string](Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "config",
        "-f",
        ".gitmodules",
        "--get",
        "submodule.immersive-reader-sdk.url"
    ))).Trim()
    $gitmodulesBranch = ([string](Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "config",
        "-f",
        ".gitmodules",
        "--get",
        "submodule.immersive-reader-sdk.branch"
    ))).Trim()
    if ($gitmodulesUrl -ne $githubRepositoryUrl -or $gitmodulesBranch -ne $GitHubBranch) {
        throw "The ADO submodule configuration does not match $githubRepositoryUrl at '$GitHubBranch'."
    }

    Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "update-index",
        "--cacheinfo",
        "160000,$targetSdkCommit,immersive-reader-sdk"
    ) | Out-Null

    & git -C $deploymentDirectory diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        $hasStagedChanges = $false
        if ($automationPullRequests.Count -eq 1) {
            Write-Host "The active automated ADO PR already points to GitHub '$GitHubBranch' commit $targetSdkCommit."
            return
        }
    }
    elseif ($LASTEXITCODE -eq 1) {
        $hasStagedChanges = $true
    }
    else {
        throw "Unable to inspect the staged submodule update."
    }

    if ($hasStagedChanges) {
        $stagedFiles = @(Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
            "diff",
            "--cached",
            "--name-only"
        ))
        $unexpectedStagedFiles = @($stagedFiles | Where-Object { $_ -and $_ -ne "immersive-reader-sdk" })
        if ($unexpectedStagedFiles.Count -gt 0 -or $stagedFiles.Count -ne 1) {
            throw "The proposed ADO commit must change only the immersive-reader-sdk gitlink."
        }
    }

    if ($DryRun) {
        Write-Host "Dry run: would update ADO '$AdoTargetBranch' from $currentSdkCommit to $targetSdkCommit using branch '$sourceBranch'."
        return
    }

    Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "config",
        "user.name",
        "Immersive Reader SDK Automation"
    ) | Out-Null
    Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
        "config",
        "user.email",
        "immersive-reader-sdk-automation@microsoft.com"
    ) | Out-Null

    if ($hasStagedChanges) {
        $commitMessage = "Update immersive-reader-sdk submodule to $($targetSdkCommit.Substring(0, 12))"
        Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @("commit", "-m", $commitMessage) | Out-Host
        Invoke-Git -WorkingDirectory $deploymentDirectory -Arguments @(
            "push",
            "--set-upstream",
            "origin",
            "HEAD:refs/heads/$sourceBranch"
        ) | Out-Host
    }

    if ($automationPullRequests.Count -eq 1) {
        Write-Host "Updated existing ADO PR $($adoPullRequest.pullRequestId) to GitHub '$GitHubBranch' commit $targetSdkCommit."
        return
    }

    $triggerDescription = "Triggered after agent-created Component Governance PR https://github.com/$GitHubRepository/pull/$MergedPullRequestNumber was merged into ``$GitHubBranch``."
    $description = @"
Advance the ``immersive-reader-sdk`` submodule from ``$currentSdkCommit`` to ``$targetSdkCommit``.

$triggerDescription

Validation is provided by ``.pipelines/OneBranch.PullRequest.yml``.
"@
    $createPayload = @{
        sourceRefName = "refs/heads/$sourceBranch"
        targetRefName = "refs/heads/$AdoTargetBranch"
        title = "Update immersive-reader-sdk submodule to $($targetSdkCommit.Substring(0, 12))"
        description = $description
    } | ConvertTo-Json
    $createdPullRequest = Invoke-RestMethod `
        -Method Post `
        -Headers $adoHeaders `
        -Uri "$adoApiBase/pullrequests?api-version=7.1" `
        -Body $createPayload `
        -ContentType "application/json"

    Write-Host "Created ADO PR $($createdPullRequest.pullRequestId): $($createdPullRequest._links.web.href)"
}
finally {
    Remove-Item Env:GIT_CONFIG_COUNT -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_CONFIG_KEY_0 -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_CONFIG_VALUE_0 -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
