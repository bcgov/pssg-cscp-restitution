# K6 Load Testing — Restitution Portal

This is the first of four planned load-test suites (Restitution, VSD, VSU, CPU).
It establishes the pattern the other three portals will follow. Read
[Rollout to the other 3 portals](#rollout-to-the-other-3-portals) before
starting on VSD/VSU/CPU.

Location: `pssg-cscp-restitution/loadtests/k6/`

## 1. Overview

### What we're testing

The Restitution app (`restitution-app`) is a public, unauthenticated ASP.NET
Core API + Angular SPA that lets victims, victim entities, and offenders
submit restitution cases, which are written straight to Dataverse. There is
no login step, which makes it the simplest of the 4 portals to load test —
no token acquisition/refresh logic is needed in the scripts.

Two kinds of journeys are covered:

| Journey                       | Script                            | Side effects                                | Safe environments         |
| ----------------------------- | --------------------------------- | ------------------------------------------- | ------------------------- |
| Health/config/lookup browsing | `scenarios/lookups-read.js`       | None (read-only)                            | local, dev, test, prod\*  |
| Full case submission          | `scenarios/restitution-submit.js` | **Creates a real case record in Dataverse** | local, dev, test **only** |

\* Running against prod still requires sign-off — see [Safety rules](#4-safety-rules).

There's also `scenarios/smoke.js`, a trivial 1-VU/3-iteration check of
`/hc`, `/api/configuration`, and `/api/lookups/countries` — run this first
whenever you're unsure the environment/script combination is wired up
correctly.

### Endpoints covered

```
GET  /hc
GET  /api/configuration
GET  /api/lookups/countries
GET  /api/lookups/provinces
GET  /api/lookups/cities
GET  /api/lookups/cities/search
GET  /api/lookups/country/{id}/cities
GET  /api/lookups/country/{id}/province/{id}/cities
GET  /api/lookups/relationships
GET  /api/lookups/auth_relationships
GET  /api/lookups/representative_relationships
GET  /api/lookups/restitution_relationships
GET  /api/lookups/police_detachments
GET  /api/lookups/courts
POST /api/restitutions/victim
POST /api/restitutions/victim-entity
POST /api/restitutions/offender
```

### Folder layout

```
loadtests/k6/
  config/environments.js   # base URLs per environment (local/dev/test/prod)
  lib/profiles.js          # load profiles: smoke/load/stress/spike/soak
  lib/thresholds.js        # shared pass/fail thresholds (read vs write)
  lib/data.js              # tagged, synthetic payload builders
  scenarios/
    smoke.js               # trivial sanity check
    lookups-read.js        # read-only browsing journey
    restitution-submit.js  # write journey (creates Dataverse records)
  run.sh / run.ps1         # wrapper: runs k6 + saves a JSON summary
  results/                 # gitignored - local run output lands here
```

## 2. Prerequisites

### Install k6

- **Windows (winget):** `winget install k6 --source winget`
- **Windows (choco):** `choco install k6`
- **macOS:** `brew install k6`
- **Linux:** see <https://k6.io/docs/get-started/installation/>
- **No install — run via container (Podman, preferred here):** see
  [Running via Podman (no local install)](#running-via-podman-no-local-install)
  below. `docker run ...` works the same way if you have Docker instead.

Verify with `k6 version`.

### Running via Podman (no local install)

If k6 isn't (and won't be) installed locally, `run.sh`/`run.ps1` can drive
the official `grafana/k6` image through Podman instead — nothing beyond
Podman itself is required, and results still land in `results/` on the
host via a bind mount.

```bash
# bash/macOS/Linux
./run.sh smoke --container -e ENV=dev

# PowerShell — note the `--%` stop-parsing token before -e flags, otherwise
# PowerShell tries to match `-e` against its own -ErrorAction/-ErrorVariable
# common parameters and fails with "parameter name 'e' is ambiguous"
.\run.ps1 smoke -Container --% -e ENV=dev
```

This is equivalent to:

```bash
podman run --rm -i -v "$(pwd):/scripts:Z" -w /scripts grafana/k6 run \
  --summary-export results/smoke-<timestamp>.summary.json -e ENV=dev scenarios/smoke.js
```

**Caveat for `ENV=local`:** `dev`/`test`/`prod` are real hostnames and work
from inside the container without any extra setup. `local` (`http://localhost:5000`)
does not — the container's `localhost` is the container itself, not your
machine, since `dotnet run` is on the host. Point the script at the host
instead with the `BASE_URL` override:

```bash
./run.sh smoke --container -e ENV=local -e BASE_URL=http://host.containers.internal:5000
```

`host.containers.internal` is Podman's (and Docker's) DNS name for the host
from inside a container; it works the same on Windows, macOS, and Linux.

### Know your target environment

| Env   | Base URL                                      | Notes                                                |
| ----- | --------------------------------------------- | ---------------------------------------------------- |
| local | `http://localhost:5000`                       | `dotnet run` from `restitution-app/`, no `BASE_PATH` |
| dev   | `https://dev.justice.gov.bc.ca/restwebforms`  |                                                      |
| test  | `https://test.justice.gov.bc.ca/restwebforms` |                                                      |
| prod  | `https://justice.gov.bc.ca/restwebforms`      | read-only journey only, sign-off required            |

## 3. How to run tests

All scripts read `ENV` (default `local`) and `PROFILE` (default `smoke`)
from `-e` flags. The examples below use the `run.sh`/`run.ps1` wrappers
with `--container`/`-Container` so k6 never needs to be installed on your
machine — see [Running via Podman (no local install)](#running-via-podman-no-local-install)
for how that works. If you do have k6 installed locally, drop
`--container`/`-Container` and call `k6 run` directly instead — every
example below works either way.

### Quick sanity check

```bash
# bash/macOS/Linux
./run.sh smoke --container -e ENV=local

# PowerShell (note the `--%` stop-parsing token before -e flags)
.\run.ps1 smoke -Container --% -e ENV=local
```

### Read-only lookup/browsing journey

```bash
# bash/macOS/Linux
./run.sh lookups-read --container -e ENV=dev -e PROFILE=load

# PowerShell
.\run.ps1 lookups-read -Container --% -e ENV=dev -e PROFILE=load
```

### Write journey (creates real Dataverse records — dev/test only)

```bash
# bash/macOS/Linux
./run.sh restitution-submit --container -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=victim

# PowerShell
.\run.ps1 restitution-submit -Container --% -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=victim
```

`CASE_TYPE` is one of `victim` (default), `victim-entity`, `offender`, or
`all` (rotates evenly through all three per iteration so a single run
covers every case type — each gets its own check/tag, e.g. `submit victim
is 200`, so pass/fail is reported per case type). Note: the console
summary's `http_req_duration` is still an aggregate across whichever types
ran; for an exact per-type latency split, inspect the tag breakdown in the
exported `results/*.summary.json`.

Start any new target/environment/profile combination with `PROFILE=smoke`
first. Only move to `load`/`stress`/`spike`/`soak` once smoke is clean.

Both wrappers write `results/<scenario>-<timestamp>.summary.json` on the
host automatically (via the bind mount in container mode) — check these
into your own scratch space or attach to a ticket, they're gitignored.

### Reviewing a results file without k6 installed

`results/*.summary.json` is plain JSON, so no k6 install is needed to read
it — but the raw structure is deeply nested and easy to misread (see the
threshold gotcha below). Use `report.ps1` to get a readable summary using
only PowerShell (already on your machine, no jq/node/k6 required):

```powershell
# most recent run in results/
.\report.ps1

# a specific file
.\report.ps1 results\restitution-submit-20260923-151549.summary.json
```

This prints threshold pass/fail, error rate, latency percentiles, and a
per-check breakdown (pass/fail per assertion name, e.g. `submit victim is
200`) pulled from `root_group.checks` — which has more detail than the
top-level `metrics` block alone.

**Gotcha:** in the raw JSON, each metric's `thresholds` object uses `true`
to mean the threshold was **breached** (failed) and `false` to mean it
held (passed) — the opposite of what the key name suggests. `report.ps1`
already accounts for this; if you ever read the JSON by hand, don't trust
a `true` value as "passing".

### Profiles

| Profile  | Purpose                                  | Shape                       |
| -------- | ---------------------------------------- | --------------------------- |
| `smoke`  | Sanity check                             | 1 VU, 5 iterations          |
| `load`   | Expected day-to-day traffic              | ramps to 10 VUs over 5 min  |
| `stress` | Find the breaking point                  | ramps to 80 VUs over 17 min |
| `spike`  | Sudden burst (e.g. reminder email blast) | 5→100→5 VUs over ~3.5 min   |
| `soak`   | Long-run leak/degradation check          | 15 VUs for ~34 min          |

## 4. Safety rules

1. **Never run `restitution-submit.js` against `prod`.** The script
   actively refuses via `assertWritesAllowed()` in
   `config/environments.js` — do not remove or bypass that check without
   team sign-off.
2. **Get sign-off before running anything against `dev`/`test`/`prod`.**
   These are shared environments other teams and testers rely on; a
   `stress`/`spike`/`soak` run can degrade Dataverse/ADFS response times for
   everyone. Post in the team channel with target env, profile, and time
   window before you start.
3. **All synthetic data is tagged.** Every write-journey payload embeds
   `K6-LOADTEST` plus a per-run marker (`RUN_MARKER`, defaults to a
   timestamp) in name/address/signature fields — see `lib/data.js`. Search
   Dataverse for `K6-LOADTEST` to find and remove everything a run created.
   Pass `-e RUN_MARKER=my-ticket-123` to make cleanup easier to track back
   to a specific test run.
4. **Never point scripts at real applicant data or reuse production PII.**
   All payload builders generate synthetic values only — do not "seed" them
   with copied production records.
5. **Respect downstream systems.** Dataverse/Dynamics and the on-prem ADFS
   proxy are shared infrastructure. If in doubt, run `stress`/`spike`/`soak`
   profiles only against `local` or `dev`, never `test` (other teams use
   `test` for UAT) without explicit coordination.

## 5. Interpreting results

k6 prints a summary at the end of every run. Key metrics:

- `http_req_failed` — the error rate. Threshold: `<1%`. Any run that fails
  this threshold means the API returned unexpected status codes (4xx/5xx)
  under load — check API logs (Splunk/Serilog) for exceptions around that
  time window.
- `http_req_duration` — response time. Read-endpoint threshold:
  `p(95)<800ms, p(99)<1500ms`. Write-endpoint threshold: `p(95)<2000ms,
p(99)<4000ms` (Dataverse writes are inherently slower).
- `checks` — should be 100% (or very close). A dropping check pass-rate
  under a `stress`/`spike` profile shows you where the system starts to
  degrade.

A threshold failure fails the k6 process (non-zero exit code) — useful for
wiring into CI later (see [CI integration](#7-cicd-integration-optional)).

If you need a visual dashboard instead of console output, stream results to
Grafana Cloud k6 or an InfluxDB+Grafana stack via `k6 run --out ...` — not
set up yet for this repo; ask in the team channel if you need it.

## 6. Support & maintenance

### When the API changes

- **New/changed endpoint:** add it to `scenarios/lookups-read.js` (reads)
  or create a new payload builder in `lib/data.js` + wire it into
  `scenarios/restitution-submit.js` (writes).
- **DTO field renamed/added/required:** update the matching builder in
  `lib/data.js`. The DTOs live in `restitution-app/Models/` — cross-check
  `RestitutionApplicationDtoBase.cs`, `VictimApplicationDto.cs`,
  `VictimEntityApplicationDto.cs`, `OffenderApplicationDto.cs`,
  `ParticipantDto.cs`, `CourtInfoDto.cs`, `DocumentDto.cs` before editing.
- Run `scenarios/smoke.js` after any script change — it's the fastest way
  to confirm the contract still matches before a longer run.

### Keeping payloads in sync

`SAMPLE_COUNTRY_ID` / `SAMPLE_PROVINCE_ID` in `lookups-read.js` are
placeholder GUIDs. For a fully representative test, capture real lookup
ids from a browser network trace (DevTools → Network, filter `/lookups/`)
against the target environment and pass them via
`-e SAMPLE_COUNTRY_ID=... -e SAMPLE_PROVINCE_ID=...`.

### Tuning profiles

The numbers in `lib/profiles.js` are conservative starting points, not
measured capacity numbers. After your first `load`/`stress` runs against
`dev`, update the profile stages to reflect:

- Actual expected concurrent users (check Splunk/App Insights for real
  traffic patterns if available).
- The point where `stress` results showed error-rate or latency
  degradation — record that ceiling in this manual (add a "Known limits"
  section once you have data).

### Cleaning up test data

After a `restitution-submit.js` run against dev/test, search Dataverse
(Advanced Find or the Dataverse Web API) for records containing
`K6-LOADTEST` and delete them. Track the `RUN_MARKER` you used so you can
scope cleanup to a specific run.

### Adding a new profile or scenario

- New load shape: add an entry to `lib/profiles.js`.
- New environment: add an entry to `config/environments.js` (add it to
  `writeEnabledEnvironments` too if writes should be permitted there).
- New user journey: create a new file under `scenarios/`, import
  `getEnvironment`/`getProfile`/thresholds the same way the existing
  scenarios do, keep it self-contained and documented at the top of the
  file like the others.

## 7. CI/CD integration (optional, not yet wired up)

Not currently part of the GitHub Actions pipeline in `.github/workflows/`.
If/when you want automated runs:

- Add a manually-triggered (`workflow_dispatch`) job that runs
  `scenarios/smoke.js` and `scenarios/lookups-read.js` (`PROFILE=load`)
  against `dev` after a deploy — never auto-trigger writes or
  stress/spike/soak profiles.
- Use the official `grafana/k6-action` GitHub Action, or run k6 via Docker
  as shown in [Prerequisites](#2-prerequisites).
- Fail the job on non-zero k6 exit code (thresholds breached).

## 8. Rollout to the other 3 portals

Repeat this same pattern (`loadtests/k6/` folder, config/lib/scenarios
split, tagged synthetic data, this manual adapted) for `pssg-cscp-vsd`,
`pssg-cscp-vsu`, and `pssg-cscp-cpu`. Key differences to account for on
those:

- **Authentication:** VSD/VSU/CPU are behind SiteMinder/Keycloak-style
  login (unlike Restitution's anonymous API) — the k6 scripts will need a
  login step (token acquisition, and reuse of the session/cookie across
  requests within a VU) before hitting protected endpoints. Budget extra
  time to design this part first; it doesn't exist anywhere in this repo
  yet as a pattern to copy.
- **Endpoint discovery:** repeat the "read every Controller" pass done
  here for Restitution against each portal's `Controllers/` folder.
- **Write-safety tagging:** reuse the `K6-LOADTEST` + `RUN_MARKER`
  convention from `lib/data.js` so cleanup is consistent across all 4
  portals.
- **Environments:** confirm each portal's actual dev/test/prod URLs from
  its root `README.md` before hardcoding — don't assume they match
  Restitution's `/restwebforms` base path.
