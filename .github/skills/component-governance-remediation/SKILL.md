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

- `liveAlertPayloadPath` (default from `CG_LIVE_ALERTS_PATH`): the structured
  active-alert payload read from the Component Governance dashboard API.
- `alertPayloadPath` (optional): a structured JSON export supplied for manual
  invocation when the live payload cannot be prepared automatically.

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
affected range, or authoritative advisory is inconclusive. Locate the exact
package and version in the current checkout before remediating it.

`dependencyScope` must be `production`, `development-only`, or `unknown`.
Determine it from the originating manifest and dependency chain:

- **production**: the package is a direct `dependency` or `optionalDependency`,
  or is transitively reachable from one.
- **development-only**: the package is reachable only from `devDependencies`.
- **unknown**: the available manifests and lockfiles cannot establish the
  originating dependency chain.

Do not infer scope from a directory name or lockfile entry alone.

## Workflow

### 1. Read the live production alerts

1. Start from the Component Governance dashboard URL configured by the
   workflow. Read only the authenticated structured Governance API payload
   prepared at `liveAlertPayloadPath`; never scrape or parse dashboard HTML.
2. Verify that the payload identifies
   `API-ImmersiveReader-Public-SDK-Deployment` and a production snapshot whose
   build type identifies pipeline `247975`.
3. Resolve the current production snapshot dynamically. The dashboard URL's
   `typeId` can be stale and must not be treated as the current snapshot ID.
4. Follow all continuation tokens when reading snapshot types and alerts.
   Record each page count in the payload and select the production snapshot
   only after every snapshot-type page has been read.
5. Require the payload count to equal the number of normalized active security
   alerts. If the payload is unavailable or invalid, stop without modifying
   files or creating a pull request.

Deduplicate alerts by advisory, package, detected version, and detected paths.

If no active security alerts remain after filtering and deduplication, stop
successfully. Make no repository changes or pull requests.

Trace dependency scope before selecting remediation order. Process production
alerts first, ordered by severity, followed by development-only alerts ordered
by severity. Do not silently discard development-only alerts. Classify alerts
whose scope cannot be established safely as **inconclusive** and report them
without automatic remediation.

Search the applicable manifests, resolutions, and lockfiles in the current
checkout for the exact alerted package/version:

- If the vulnerable version is absent from all applicable dependency sources,
  classify the alert as **already remediated** and record the current resolved
  version.
- If it remains, continue with advisory and registry verification.
- If only a generated `node_modules` path remains, trace it to its dependency
  source and never edit the generated package.

### 2. Check for existing fixes before editing

For every active alert, search both open and merged pull requests using:

- alert ID;
- GHSA or CVE identifier;
- package name;
- detected version and proposed fixed version.

Apply these rules before changing any file:

- Matching open PR: classify as **duplicate** and create no PR.
- Matching merged PR whose fix is present on the current base: classify as
  **already remediated** and create no PR.
- Closed-unmerged PR: not a completed fix; continue evaluating the alert.
- Ambiguous match: stop that alert as **inconclusive** rather than risk a
  duplicate PR.

If all alerts are duplicates or already remediated, stop with no repository
changes and no pull requests.

### 3. Verify the repository and current dependency state

1. Confirm the checkout is `microsoft/immersive-reader-sdk`.
2. Preserve unrelated work.
3. Locate the exact alerted package and version in manifests and lockfiles.
4. If the vulnerable version is absent, classify it as **already remediated**.

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
     `copilot/cg-<normalized-package>-<fixed-version>-<snapshot-type-id>`.
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
   - Leave every validated package change local and uncommitted unless the user
     explicitly asks for a commit.
   - Do not use GitHub CLI, call a GitHub write API, push branches, or create
     pull requests automatically.
   - Return a proposed branch name, commit message, PR title, and complete PR
     body for each package so a maintainer can review the local changes first.
3. Every draft PR body must be non-empty and include:
   - Component Governance dashboard link and snapshot type ID;
   - a table containing alert ID, severity, dependency scope, package, current
     version, upgraded version, and advisory;
   - direct and transitive dependency changes;
   - affected files;
   - validation commands and results;
   - skipped alerts only when they concern the same package.
4. Add the alert IDs, advisory identifiers, package name, detected version, and
   fixed version to each PR body so later runs can detect duplicates.

Never mark Component Governance alerts resolved. The next governance scan is
the authoritative verification.

## Required final report

| Alert | Scope | Package | Detected | Candidate | Classification | Result |
| ----- | ----- | ------- | -------: | --------: | -------------- | ------ |

Follow the table with automated draft PR URLs, proposed manual PR details, or
exact blocking reasons, grouped by package.
