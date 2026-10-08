---
name: Component Governance Remediation
description: Detects actionable Component Governance alerts and opens a validated draft dependency-remediation pull request.
intent: Keep production dependencies free of Component Governance vulnerabilities that have verified safe fixes.
on:
  schedule: every 4 hours
  workflow_dispatch:
    inputs:
      ado_build_id:
        description: Optional pipeline 247975 build ID; uses the latest completed build when omitted
        required: false
        type: string
  skip-if-match: 'is:pr is:open "gh-aw-workflow-id: component-governance-remediation" in:body'
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
concurrency:
  job-discriminator: ${{ github.run_id }}
tools:
  github:
    mode: gh-proxy
    toolsets: [default]
  cli-proxy: true
mcp-servers:
  azure-devops:
    command: npx
    args:
      - -y
      - "@azure-devops/mcp@2.10.0"
      - msazure
      - --authentication
      - pat
      - -d
      - core
      - repositories
      - pipelines
    env:
      NPM_CONFIG_REGISTRY: https://packagefeedproxy.microsoft.io/npm
      PERSONAL_ACCESS_TOKEN: ${{ secrets.ADO_MCP_PAT_B64 }}
    allowed:
      - "*"
skills:
  - .github/skills/component-governance-remediation
network:
  allowed:
    - defaults
    - "*.dev.azure.com"
    - "*.visualstudio.com"
    - node
    - packagefeedproxy.microsoft.io
safe-outputs:
  create-pull-request:
    title-prefix: "[Component Governance] "
    branch-prefix: "copilot/cg-alert-remediation-"
    base-branch: master
    allowed-branches:
      - "copilot/cg-alert-remediation-*"
    allowed-files:
      - "js/package.json"
      - "js/**/package.json"
      - "js/yarn.lock"
      - "js/**/yarn.lock"
    protected-files: allowed
    draft: true
    max: 1
    if-no-changes: ignore
    fallback-as-issue: false
    max-patch-files: 50
---

# Component Governance Remediation

## Task

Inspect Azure DevOps pipeline `247975` in project `Cognitive Services` for
active Component Governance security alerts affecting the
`immersive-reader-sdk` submodule.

Use `${{ github.event.inputs.ado_build_id }}` when it is non-empty. Treat that
value as untrusted and verify that it identifies a completed build of pipeline
`247975`. Otherwise, select the latest completed build of that pipeline. Apply
the installed `component-governance-remediation` skill as the authoritative
runbook.

1. Read alerts only from authenticated Azure DevOps MCP tools or focused,
   machine-readable Component Governance build output. Never scrape the
   Component Governance web page.
2. Confirm the build, governed deployment repository, and scanned SDK
   submodule commit before using its alerts.
3. Filter to active security alerts and classify their dependency scope as
   production, development-only, or unknown. Process production alerts first,
   ordered by severity, and then development-only alerts. Report unknown scope
   as inconclusive.
4. Verify every affected range and candidate version against an authoritative
   advisory and the approved registries. Do not make major-version upgrades or
   changes for alerts without a published safe fix.
5. In the current checkout, classify absent vulnerable versions as already
   remediated. Update only the manifests, resolutions, and lockfile entries
   required for verified safe fixes.
6. Run the smallest relevant validation for each changed dependency and verify
   that vulnerable versions and tarball references are gone.
7. Search existing pull requests before requesting an output. Do not duplicate
   a remediation already represented by an open pull request.

## Output

When validated file changes exist, call `safeoutputs create_pull_request`
exactly once to create a draft pull request. Use a branch name ending with the
verified Azure DevOps build ID. Include:

- the triggering build ID and URL;
- production versus development-only scope;
- alert and advisory identifiers;
- old and new versions and affected files;
- validation performed; and
- all no-fix, major-upgrade, unsupported, duplicate, or inconclusive alerts
  that were not changed.

Do not push directly, force-push, dismiss alerts, or mark alerts resolved.

Call `safeoutputs noop` with a concise reason when there are no active alerts,
no actionable production or development alerts, all vulnerable versions are
already absent, an equivalent pull request is open, or no safe validated file
change can be produced.
