---
name: Component Governance Remediation
description: Detects actionable Component Governance alerts and opens one validated draft remediation pull request per upgraded package.
intent: Keep production dependencies free of Component Governance vulnerabilities that have verified safe fixes.
on:
  schedule: every 4 hours
  workflow_dispatch:
    inputs:
      ado_build_id:
        description: Optional pipeline 247975 build ID; uses the latest completed build when omitted
        required: false
        type: string
  skip-if-match:
    query: 'is:pr is:open "gh-aw-workflow-id: component-governance-remediation" in:body'
    max: 10
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
    max: 10
    if-no-changes: ignore
    fallback-as-issue: false
    max-patch-files: 25
    stacked: false
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
   remediated. Group actionable alerts by primary upgraded package. Required
   transitive dependency changes belong to the primary package that introduces
   them; they are not separate package upgrades.
6. Run the smallest relevant validation for each changed dependency and verify
   that vulnerable versions and tarball references are gone.
7. Search existing pull requests before requesting an output. Do not duplicate
   a package remediation already represented by an open pull request.

## Output

Create one independent draft pull request per primary upgraded package. Never
combine unrelated package upgrades in one pull request.

For each package:

1. Start from the unchanged verified base and isolate only that package's
   manifest, resolution, lockfile, and required transitive changes.
2. Validate the isolated patch independently.
3. Call `safeoutputs create_pull_request` exactly once for that package, using
   a branch suffix `<normalized-package>-<build-id>`.
4. Provide a non-empty title naming the package and upgraded version.
5. Provide a non-empty body containing this tracking table:

   | Alert | Severity | Scope | Package | Current version | Upgraded version | Advisory |
   | ----- | -------- | ----- | ------- | --------------- | ---------------- | -------- |

6. After the table, list the triggering build ID and URL, affected files,
   direct and transitive changes, and validation commands with their results.

Multiple advisories or vulnerable versions of the same package belong in that
package's PR. If package patches cannot be isolated cleanly, do not create a
combined PR; report the conflicting package groups as inconclusive.

Do not push directly, force-push, dismiss alerts, or mark alerts resolved.

Call `safeoutputs noop` with a concise reason when there are no active alerts,
no actionable production or development alerts, all vulnerable versions are
already absent, every package already has an equivalent pull request, or no
safe validated package patch can be produced.
