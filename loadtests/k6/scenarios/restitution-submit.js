// Write journey: submits a restitution case end-to-end, the same way the
// Angular client does (load lookups, then POST the completed application).
//
// !! THIS SCENARIO CREATES REAL RECORDS IN DATAVERSE !!
// It refuses to run unless ENV is one of config/environments.js's
// `writeEnabledEnvironments` (local/dev/test) - never point it at prod.
//
//   k6 run -e ENV=dev -e PROFILE=smoke -e CASE_TYPE=victim scenarios/restitution-submit.js
//
// CASE_TYPE selects which endpoint/payload to exercise: victim (default),
// victim-entity, offender, or `all` (rotates evenly through all three so a
// single run reports on every case type - each gets its own metric tag,
// e.g. `POST /api/restitutions/victim`, so the summary breaks down cleanly
// per case type instead of averaging them together).
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';
import { assertWritesAllowed, getEnvironment } from '../config/environments.js';
import { buildOffenderRestitutionPayload, buildVictimEntityRestitutionPayload, buildVictimRestitutionPayload } from '../lib/data.js';
import { getProfile } from '../lib/profiles.js';
import { writeThresholds } from '../lib/thresholds.js';

const env = getEnvironment();
const profile = getProfile();
const caseType = __ENV.CASE_TYPE || 'victim';

assertWritesAllowed(env.name);

const CASE_TYPES = {
  victim: { path: 'victim', build: buildVictimRestitutionPayload },
  'victim-entity': { path: 'victim-entity', build: buildVictimEntityRestitutionPayload },
  offender: { path: 'offender', build: buildOffenderRestitutionPayload },
};
const CASE_TYPE_NAMES = Object.keys(CASE_TYPES);

if (caseType !== 'all' && !CASE_TYPES[caseType]) {
  throw new Error(`Unknown CASE_TYPE "${caseType}". Valid options: ${CASE_TYPE_NAMES.join(', ')}, all`);
}

export const options = {
  scenarios: {
    [profile.name]: profile.config,
  },
  thresholds: writeThresholds,
};

export default function () {
  // Step 1: load the lookups a real user's browser would fetch first.
  const countriesRes = http.get(`${env.apiUrl}/lookups/countries`, {
    tags: { name: 'GET /api/lookups/countries' },
  });
  check(countriesRes, { 'countries is 200': (r) => r.status === 200 });

  sleep(1);

  // Step 2: submit the completed application. In `all` mode, rotate evenly
  // through every case type using the global iteration count so results
  // stay balanced across VUs and profiles.
  const activeType = caseType === 'all' ? CASE_TYPE_NAMES[exec.scenario.iterationInTest % CASE_TYPE_NAMES.length] : caseType;
  const { path, build } = CASE_TYPES[activeType];
  const payload = build();

  const submitRes = http.post(`${env.apiUrl}/restitutions/${path}`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: `POST /api/restitutions/${path}` },
  });

  check(submitRes, {
    [`submit ${path} is 200`]: (r) => r.status === 200,
    [`submit ${path} is not a server error`]: (r) => r.status < 500,
  });

  sleep(1);
}
