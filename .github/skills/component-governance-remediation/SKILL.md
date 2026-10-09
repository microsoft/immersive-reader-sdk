---
name: component-governance-remediation
description: Safely converts active Component Governance security alerts from Azure DevOps pipeline 247975 into validated JavaScript dependency updates and one draft GitHub pull request per upgraded package.
---

# Skill: Component Governance Remediation

## Scope

Use this skill only for active security alerts associated with:

- Azure DevOps organization: `msazure`
- Project: `Cognitive Services`
- Pipeline definition: `247975`
- Governed repository: `API-ImmersiveReader-Public-SDK-Deployment`
- Governed repository source path: `immersive-reader-sdk` Git submodule
- Remediation repository: `microsoft/immersive-reader-sdk`

This skill supports npm-compatible packages represented by `package.json`,
Yarn v1 `yarn.lock`, or npm `package-lock.json` files.

## Inputs

- `adoBuildId` (required): the completed triggering build.
- `adoOrganization` (default `msazure`).
- `adoProject` (default `Cognitive Services`).
- `adoPipelineId` (default `247975`).
- `alertPayloadPath` (optional): a structured JSON export supplied for manual
  invocation when the authenticated ADO tools cannot read active alerts.
- `remediationTarget` (default `currentCheckout`):
  - `currentCheckout` remediates the SDK repository and branch currently open.
  - `buildCommit` remediates the exact SDK submodule commit tested by the build.

## Alert contract

Normalize each alert to this shape in session storage, never in the repository:

```json
{
  "alertId": "",
  "state": "active",
  "severity": "",
  "package": "",
  "detectedVersion": "",
  "affectedRange": "",
  "fixedVersion": "",
  "advisoryUrl": "",
  "cve": "",
  "detectedPaths": [],
  "dependencyScope": "unknown",
  "sourceBuildId": ""
}
```

Do not invent missing fields. An alert without a package, detected version,
affected range or authoritative advisory, and at least one detected path is
inconclusive and must not be remediated automatically.

`dependencyScope` must be `production`, `development-only`, or `unknown`.
Determine it from the originating manifest and dependency chain:

- **production**: the package is a direct `dependency` or `optionalDependency`,
  or is transitively reachable from one.
- **development-only**: the package is reachable only from `devDependencies`.
- **unknown**: the available manifests and lockfiles cannot establish the
  originating dependency chain.

Do not infer scope from a directory name or lockfile entry alone.

## Workflow

### 1. Resolve and verify the triggering build

1. Read build `adoBuildId` with the ADO MCP.
2. Confirm its definition ID is `247975` and its repository is
   `API-ImmersiveReader-Public-SDK-Deployment`. Stop on a mismatch.
3. Accept completed `Succeeded`, `PartiallySucceeded`, or `Failed` builds.
   Component Governance alerts do not necessarily fail a build.
4. Resolve the `immersive-reader-sdk` gitlink at the deployment repository
   commit tested by the build. Confirm that it points to
   `https://github.com/microsoft/immersive-reader-sdk.git`, and record the exact
   submodule commit.
5. Record the deployment source version, submodule source version, source
   branch, build URL, and completion time.
6. Use only focused Component Governance task logs and machine-readable
   outputs. Do not download or expose unrelated logs.

Select the remediation baseline from `remediationTarget`:

- `currentCheckout`: use the open SDK repository's current branch and `HEAD`.
  Record any difference from the build's submodule commit. The build alerts may
  be stale relative to this checkout, so re-detect every alerted
  package/version locally before changing files.
- `buildCommit`: require `HEAD` to equal the resolved SDK submodule commit.

Reject any other value.

### 2. Read active Component Governance alerts

Use the first supported source that returns structured alert data:

1. An authenticated Component Governance or Governance tool exposed by the ADO
   MCP for the governed repository.
2. The focused log from the successful `ComponentGovernanceComponentDetection`
   timeline task whose display name starts with `Component Governance`.
3. A machine-readable Component Governance alert artifact produced by the
   target build.
4. Structured JSON emitted by the Component Governance pipeline task.
5. The manually supplied `alertPayloadPath`, after validating it against the
   target build and advisory sources.

Filter to active security alerts. Do not treat component inventory as alert
data, and do not infer alerts solely from package versions.

For the verified pipeline shape:

1. Read the build timeline.
2. Select the successful `ComponentGovernanceComponentDetection` task named
   `Component Governance (...)`. Do not select the post-job
   `Component Detection (auto-injected by policy)` entry when it is skipped.
3. Read only that task's log.
4. Parse rows beneath the `Security Alerts` table into alert title, affected
   component, version, severity, and due date.
5. Parse the preceding `--- Component: ---` / `--- Found at: ---` records to map
   each affected component and version to detected paths.
6. Record the `Component Governance Alerts` URL emitted by the task. Do not
   hard-code its governed-repository ID or `typeId`; those values can differ
   between runs and views.
7. Verify that the task's reported alert count equals the number of parsed
   alert rows. Stop as inconclusive on a mismatch.

The task log does not provide a patched version or full advisory details. Resolve
those independently from the alert title and authoritative advisory sources
before classifying an alert as safe.

The deployment repository enables Component Governance through OneBranch
`globalSdl.cg` in `.pipelines/OneBranch.Official.yml`. The governed OneBranch
template produces the Component Governance results; the repository itself does
not contain a tracked active-alert export. Its checked-in `yarn.lock` is not an
alert source.

The governed deployment repository currently contains
`.config/PolicheckExclusion.xml` and `.config/tsaoptions.json`. Neither is an
alert source:

- `PolicheckExclusion.xml` contains terminology-scan path and filename
  exclusions only.
- `tsaoptions.json` contains TSA project routing and notification settings only.

Do not parse either file for dependency alerts. A future file in the deployment
repository is eligible only when its documented schema includes active security
alerts with package versions, affected paths, and advisory identifiers.

The Component Governance web route is useful only as a human link:

`https://dev.azure.com/msazure/cognitive%20services/_componentGovernance/API-ImmersiveReader-Public-SDK-Deployment?_a=alerts&alerts-view-option=active`

Never scrape this page. If no authenticated structured alert source is
available, stop without modifying files or creating a pull request. Report the
missing API/artifact capability explicitly.

Deduplicate alerts by advisory, package, detected version, and detected paths.

If no active security alerts remain after filtering and deduplication, stop
successfully. Make no repository changes, create no branch or pull request, and
return the triggering build details with an explicit no-alerts result.

Trace dependency scope before selecting remediation order. Process production
alerts first, ordered by severity, followed by development-only alerts ordered
by severity. Do not silently discard development-only alerts. Classify alerts
whose scope cannot be established safely as **inconclusive** and report them
without automatic remediation.

In `currentCheckout` mode, search the applicable manifests, resolutions, and
lockfiles for the exact alerted package/version:

- If the vulnerable version is absent from all applicable dependency sources,
  classify the alert as **already remediated** and record the current resolved
  version.
- If it remains, continue with advisory and registry verification.
- If only a generated `node_modules` path remains, trace it to its dependency
  source and never edit the generated package.

### 3. Preflight repository and pull-request access

Before editing:

1. Confirm the checkout is `microsoft/immersive-reader-sdk` and matches the
   selected remediation baseline.
2. Require a clean worktree.
3. Determine the default branch from Git; do not assume its name.
4. Read the configured `origin` and `upstream` remotes. Confirm the target
   repository and fork relationship instead of assuming either remote name or
   owner.
5. Confirm the existing Git credentials can read the target remotes. Branch
   push permission is verified only by the later non-force push.
6. If authenticated GitHub tooling is available, search open pull requests for
   the alert ID, CVE/advisory, package, and fixed version. Mark exact matches as
   duplicates and do not create another PR.
7. Without authenticated GitHub tooling, search remote branch names for the
   deterministic remediation branch before editing. Stop when it already
   exists, and report that a human must check for a corresponding PR.

Do not reveal GitHub credentials or tokens. GitHub CLI authentication is
optional; existing Git credentials are sufficient for branch push and manual
draft-PR handoff.

### 4. Establish a safe patched version

For each alert:

1. Read the advisory linked by Component Governance and identify the affected
   range and first patched version.
2. Query only approved registries:
   - `https://packagefeedproxy.microsoft.io/npm`
   - `https://registry.yarnpkg.com`
3. Verify the candidate exists and obtain its dependency metadata, tarball
   checksum, and integrity value.
4. Confirm the candidate is outside every affected range in the alert.
5. Confirm whether the candidate is a patch, minor, or major change relative
   to the detected version.

Classification:

- **Safe**: published patch or minor version outside the affected range.
- **No fix**: no published version is outside the affected range.
- **Major upgrade**: the first patched version changes the major version.
- **Already remediated**: the exact vulnerable version is absent from the
  current checkout's applicable dependency sources.
- **Inconclusive**: advisory or registry evidence conflicts or is incomplete.

Automatically remediate only **Safe** alerts. Never upgrade merely to the
latest version without proving it fixes the advisory.

### 5. Map detections to dependency sources

For every detected path:

1. If it is under `node_modules`, find the nearest owning manifest and lockfile.
   Update those sources, never the installed file.
2. Determine whether the package is:
   - a direct dependency;
   - a root `resolutions` override;
   - a transitive lockfile dependency.
3. Search all manifests and lockfiles under the same package root so the
   vulnerable version cannot be recreated by another source.
4. Preserve separate package roots. Do not update unrelated samples solely
   because they use the same package.

### 6. Apply the update

1. Group safe alerts by primary upgraded package. Multiple advisories and
   vulnerable versions for the same package stay together. Required transitive
   dependency changes stay with the primary package that introduces them.
2. Select the branch behavior for the execution environment:
   - In a GitHub Agentic Workflow with `create-pull-request` safe output, keep
     each package patch on an isolated local branch or commit based on the
     unchanged verified source revision. Provide an allowed branch name to the
     safe output and do not push directly.
   - Otherwise, create a separate branch for each upgraded package from the
     verified source revision using
     `copilot/cg-<normalized-package>-<fixed-version>-<build-id>`.
3. Use the repository's existing package manager and lockfile version.
4. Update direct dependency or resolution declarations when they control the
   detected package.
5. Regenerate affected lockfiles with the package manager and approved
   registry. Do not hand-edit generated lockfiles unless package-manager
   generation is impossible and the repository already follows a documented
   manual lockfile-update process.
6. Include required transitive dependency changes introduced by the patched
   package. Do not omit them to minimize the diff.
7. Do not upgrade unrelated packages. If regeneration produces unrelated
   churn, revert the churn or classify the remediation as inconclusive.

Each package patch must be independently reviewable and valid against the same
base revision. If package patches overlap in a way that cannot be isolated,
create no combined fix and report the conflict for manual handling.

### 7. Validate the exact remediation

For each changed package root:

1. Parse every changed manifest.
2. Verify each changed lockfile resolves the patched version and contains no
   vulnerable tarball reference for the alert.
3. Verify required transitive selectors and integrity values are present.
4. Run the smallest existing install, build, test, lint, or audit command that
   covers the changed package root.
5. Run `git diff --check`.
6. Review the final diff for unrelated dependency churn and secrets.

If validation fails, do not push or create a pull request. Report the failure
and leave the alert classified as inconclusive.

### 8. Commit, push, and prepare a draft pull request

Only after all validation succeeds:

1. In a GitHub Agentic Workflow with `create-pull-request` safe output:
   - Do not push, invoke `gh pr create`, or write through a GitHub API tool.
   - Request the configured safe output exactly once per upgraded package with
     that package's isolated validated changes, allowed branch name, title, and
     non-empty body.
   - Use `noop` only when no package has validated file changes.
2. In other execution environments:
   - Commit each package's dependency-source and lockfile changes separately
     with a concise security upgrade message.
   - Push each package branch without force.
   - When `gh auth status` succeeds, create one **draft** pull request per
     package with `gh pr create --draft`.
   - When authenticated GitHub tooling is unavailable, construct a GitHub
     compare URL for each package branch from the actual base repository,
     default branch, pushed fork owner, and remediation branch. Return each URL
     and instruct the user to select **Create draft pull request**. Do not claim
     that a pull request exists.
3. Every draft PR body must be non-empty and include:
   - triggering Azure DevOps build and Component Governance links;
   - a table containing alert ID, severity, dependency scope, package, current
     version, upgraded version, and advisory;
   - direct and transitive dependency changes;
   - affected files;
   - validation commands and results;
   - skipped alerts only when they concern the same package.
4. Add the alert IDs, package name, and build ID to each PR body so later runs
   can detect duplicates.

Never mark Component Governance alerts resolved. The next governance scan is
the authoritative verification.

## Required final report

| Alert | Scope | Package | Detected | Candidate | Classification | Result |
| ----- | ----- | ------- | -------: | --------: | -------------- | ------ |

Follow the table with the draft PR URLs, manual draft-PR compare URLs, or exact
blocking reasons, grouped by package.
