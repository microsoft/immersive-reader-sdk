---
name: Component Governance Remediation
description: Detects actionable Component Governance alerts and opens one validated draft remediation pull request per upgraded package.
intent: Keep production dependencies free of Component Governance vulnerabilities that have verified safe fixes.
on:
  schedule: daily
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
    - graph.microsoft.com
    - login.microsoftonline.com
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
  jobs:
    send-remediation-email:
      description: Send one notification email after remediation pull requests are created
      needs: safe_outputs
      runs-on: ubuntu-latest
      output: Remediation email sent
      inputs:
        summary:
          description: Plain-text summary of the package pull requests requested in this run
          required: true
          type: string
      permissions:
        contents: read
        pull-requests: read
      env:
        EMAIL_CLIENT_ID: ${{ vars.CG_EMAIL_CLIENT_ID }}
        EMAIL_CLIENT_SECRET: ${{ secrets.CG_EMAIL_CLIENT_SECRET }}
        EMAIL_SENDER: ${{ vars.CG_EMAIL_SENDER }}
        EMAIL_TENANT_ID: ${{ vars.CG_EMAIL_TENANT_ID }}
        CREATED_PR_URLS: ${{ needs.safe_outputs.outputs.created_pr_url }}
      steps:
        - name: Send remediation email with Microsoft Graph
          shell: bash
          run: |
            set -euo pipefail

            if [ -z "${CREATED_PR_URLS:-}" ]; then
              echo "No pull request was created; skipping email."
              exit 0
            fi

            for required in EMAIL_CLIENT_ID EMAIL_CLIENT_SECRET EMAIL_SENDER EMAIL_TENANT_ID; do
              if [ -z "${!required:-}" ]; then
                echo "::error::Required email configuration $required is missing."
                exit 1
              fi
            done

            summary=$(jq -r '
              [.items[]
                | select(.type == "send_remediation_email")
                | .summary]
              | join("\n\n")
            ' "$GH_AW_AGENT_OUTPUT")
            summary=${summary:0:12000}

            token_response=$(curl --fail-with-body --silent --show-error \
              --request POST \
              --data-urlencode "client_id=${EMAIL_CLIENT_ID}" \
              --data-urlencode "client_secret=${EMAIL_CLIENT_SECRET}" \
              --data-urlencode "scope=https://graph.microsoft.com/.default" \
              --data-urlencode "grant_type=client_credentials" \
              "https://login.microsoftonline.com/${EMAIL_TENANT_ID}/oauth2/v2.0/token")
            access_token=$(jq -er '.access_token' <<< "$token_response")
            echo "::add-mask::$access_token"

            run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
            body=$(printf '%s\n\nPull request URL(s):\n%s\n\nWorkflow run:\n%s' \
              "$summary" "$CREATED_PR_URLS" "$run_url")
            payload=$(jq -n \
              --arg subject "Component Governance remediation pull request created" \
              --arg body "$body" \
              '{
                message: {
                  subject: $subject,
                  body: {
                    contentType: "Text",
                    content: $body
                  },
                  toRecipients: [
                    {emailAddress: {address: "v-meghashg@microsoft.com"}},
                    {emailAddress: {address: "v-crbuenrost@microsoft.com"}}
                  ]
                },
                saveToSentItems: true
              }')

            curl --fail-with-body --silent --show-error \
              --request POST \
              --header "Authorization: Bearer ${access_token}" \
              --header "Content-Type: application/json" \
              --data "$payload" \
              "https://graph.microsoft.com/v1.0/users/${EMAIL_SENDER}/sendMail"
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

After requesting all package pull requests, call
`safeoutputs send_remediation_email` exactly once with a plain-text summary of
the packages, alert IDs, and current-to-upgraded versions. The email job runs
after pull-request creation and skips delivery when no pull request was
created.

Do not push directly, force-push, dismiss alerts, or mark alerts resolved.

Call `safeoutputs noop` with a concise reason when there are no active alerts,
no actionable production or development alerts, all vulnerable versions are
already absent, every package already has an equivalent pull request, or no
safe validated package patch can be produced.
