---
name: Component Governance Remediation
description: Detects actionable Component Governance alerts and opens one validated draft remediation pull request per upgraded package.
intent: Keep production dependencies free of Component Governance vulnerabilities that have verified safe fixes.
on:
  schedule: daily
  workflow_dispatch:
  skip-if-match:
    query: 'is:pr is:open "gh-aw-workflow-id: component-governance-remediation" in:body'
    max: 10
steps:
  - name: Read live production Component Governance alerts
    shell: pwsh
    env:
      ADO_MCP_PAT_B64: ${{ secrets.ADO_MCP_PAT_B64 }}
    run: |
      ./.github/scripts/component-governance-preflight.ps1 `
        -OutputPath "$env:RUNNER_TEMP/component-governance-live-alerts.json"
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
    max: 10
    if-no-changes: ignore
    fallback-as-issue: false
    max-patch-files: 25
    stacked: false
# Email notification is intentionally disabled pending an approved mail
# authentication design. Intended recipients: v-meghashg@microsoft.com and
# v-crbuenrost@microsoft.com.
---

# Component Governance Remediation

## Task

Read current production security alerts from `$CG_LIVE_ALERTS_PATH`. This file
is obtained from the authenticated structured API behind the configured
Component Governance dashboard. Never scrape the dashboard HTML and never
queue a pipeline to discover alerts.

Apply the installed `component-governance-remediation` skill as the
authoritative runbook:

1. Stop without changes or pull requests when `$CG_LIVE_ALERTS_STATUS` is not
   `available`.
2. Verify that the payload resolves the governed repository and the current
   production snapshot for pipeline `247975`; do not trust or hard-code the
   dashboard URL's `typeId`. Follow every API continuation token for snapshot
   types and alerts before selecting the snapshot or reporting the alert count.
3. For every alert, search open and merged pull requests before editing. Match
   on alert ID or advisory plus package and vulnerable/fixed versions.
4. If a matching pull request is open, classify the alert as `duplicate` and
   do not create another pull request.
5. If a matching pull request is merged and the current base no longer
   contains the vulnerable version, classify the alert as `already remediated`
   and do not create another pull request. A closed-unmerged pull request is
   not a completed fix.
6. Classify remaining alerts as production, development-only, or unknown by
   tracing the dependency. Process production alerts first and report unknown
   scope as inconclusive.
7. Verify every affected range and candidate version against an authoritative
   advisory and the approved registries. Do not make major-version upgrades or
   changes for alerts without a published safe fix.
8. In the current checkout, classify absent vulnerable versions as already
   remediated. Group actionable alerts by primary upgraded package. Required
   transitive dependency changes belong to the primary package that introduces
   them; they are not separate package upgrades.
9. Run the smallest relevant validation for each changed dependency and verify
   that vulnerable versions and tarball references are gone.

## Output

Create one independent draft pull request per primary upgraded package. Never
combine unrelated package upgrades in one pull request.

For each package:

1. Start from the unchanged verified base and isolate only that package's
   manifest, resolution, lockfile, and required transitive changes.
2. Validate the isolated patch independently.
3. Call `safeoutputs create_pull_request` exactly once for that package, using
   a branch suffix `<normalized-package>-<snapshot-type-id>`.
4. Provide a non-empty title naming the package and upgraded version.
5. Provide a non-empty body containing this tracking table:

   | Alert | Severity | Scope | Package | Current version | Upgraded version | Advisory |
   | ----- | -------- | ----- | ------- | --------------- | ---------------- | -------- |

6. After the table, list the Component Governance dashboard URL and snapshot
   type ID, affected files, direct and transitive changes, and validation
   commands with their results.

Multiple advisories or vulnerable versions of the same package belong in that
package's PR. If package patches cannot be isolated cleanly, do not create a
combined PR; report the conflicting package groups as inconclusive.

Do not push directly, force-push, dismiss alerts, or mark alerts resolved.

Call `safeoutputs noop` with a concise reason when there are no active alerts,
no actionable production or development alerts, all vulnerable versions are
already absent, every alert already has an open or merged fixing pull request,
or no safe validated package patch can be produced.
