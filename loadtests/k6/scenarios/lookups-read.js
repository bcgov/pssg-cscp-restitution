// Read-only "public visitor" journey: exercises every GET endpoint the
// Angular client calls while a user fills out the restitution form
// (country/province/city cascades, relationship lookups, configuration
// flags, health check). No data is written, so this scenario is safe to
// run against any environment, including prod, once you've cleared it
// with the team (see MANUAL.md "Safety rules").
//
//   k6 run -e ENV=dev -e PROFILE=load scenarios/lookups-read.js
import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { getEnvironment } from '../config/environments.js';
import { getProfile } from '../lib/profiles.js';
import { readThresholds } from '../lib/thresholds.js';

const env = getEnvironment();
const profile = getProfile();

export const options = {
  scenarios: {
    [profile.name]: profile.config,
  },
  thresholds: readThresholds,
};

// A few real-looking GUIDs are needed for the cascading city lookups. These
// are placeholders - swap in real lookup ids captured from a browser/HAR
// trace against the target environment for a representative test (see
// MANUAL.md "Keeping payloads in sync").
const SAMPLE_COUNTRY_ID = __ENV.SAMPLE_COUNTRY_ID || '00000000-0000-0000-0000-000000000001';
const SAMPLE_PROVINCE_ID = __ENV.SAMPLE_PROVINCE_ID || '00000000-0000-0000-0000-000000000002';

export default function () {
  group('health + configuration', function () {
    const hcRes = http.get(env.healthUrl, { tags: { name: 'GET /hc' } });
    check(hcRes, { 'hc is 200': (r) => r.status === 200 });

    const configRes = http.get(`${env.apiUrl}/configuration`, {
      tags: { name: 'GET /api/configuration' },
    });
    check(configRes, { 'configuration is 200': (r) => r.status === 200 });
  });

  group('address lookups', function () {
    const countriesRes = http.get(`${env.apiUrl}/lookups/countries`, {
      tags: { name: 'GET /api/lookups/countries' },
    });
    check(countriesRes, { 'countries is 200': (r) => r.status === 200 });

    const provincesRes = http.get(`${env.apiUrl}/lookups/provinces`, {
      tags: { name: 'GET /api/lookups/provinces' },
    });
    check(provincesRes, { 'provinces is 200': (r) => r.status === 200 });

    const citiesRes = http.get(`${env.apiUrl}/lookups/cities`, {
      tags: { name: 'GET /api/lookups/cities' },
    });
    check(citiesRes, { 'cities is 200': (r) => r.status === 200 });

    const citiesByCountryRes = http.get(`${env.apiUrl}/lookups/country/${SAMPLE_COUNTRY_ID}/cities`, {
      tags: { name: 'GET /api/lookups/country/{id}/cities' },
    });
    check(citiesByCountryRes, { 'cities by country is 200 or 400': (r) => [200, 400].includes(r.status) });

    const citiesByProvinceRes = http.get(`${env.apiUrl}/lookups/country/${SAMPLE_COUNTRY_ID}/province/${SAMPLE_PROVINCE_ID}/cities`, { tags: { name: 'GET /api/lookups/country/{id}/province/{id}/cities' } });
    check(citiesByProvinceRes, { 'cities by province is 200 or 400': (r) => [200, 400].includes(r.status) });

    const citySearchRes = http.get(`${env.apiUrl}/lookups/cities/search?country=Canada&province=BC&searchVal=Vic&limit=10`, { tags: { name: 'GET /api/lookups/cities/search' } });
    check(citySearchRes, { 'city search is 200': (r) => r.status === 200 });
  });

  group('relationship + court lookups', function () {
    const relationshipsRes = http.get(`${env.apiUrl}/lookups/relationships`, {
      tags: { name: 'GET /api/lookups/relationships' },
    });
    check(relationshipsRes, { 'relationships is 200': (r) => r.status === 200 });

    const authRelationshipsRes = http.get(`${env.apiUrl}/lookups/auth_relationships`, {
      tags: { name: 'GET /api/lookups/auth_relationships' },
    });
    check(authRelationshipsRes, { 'auth relationships is 200': (r) => r.status === 200 });

    const representativeRelationshipsRes = http.get(`${env.apiUrl}/lookups/representative_relationships`, {
      tags: { name: 'GET /api/lookups/representative_relationships' },
    });
    check(representativeRelationshipsRes, { 'representative relationships is 200': (r) => r.status === 200 });

    const restitutionRelationshipsRes = http.get(`${env.apiUrl}/lookups/restitution_relationships`, {
      tags: { name: 'GET /api/lookups/restitution_relationships' },
    });
    check(restitutionRelationshipsRes, { 'restitution relationships is 200': (r) => r.status === 200 });

    const policeDetachmentsRes = http.get(`${env.apiUrl}/lookups/police_detachments`, {
      tags: { name: 'GET /api/lookups/police_detachments' },
    });
    check(policeDetachmentsRes, { 'police detachments is 200': (r) => r.status === 200 });

    const courtsRes = http.get(`${env.apiUrl}/lookups/courts`, {
      tags: { name: 'GET /api/lookups/courts' },
    });
    check(courtsRes, { 'courts is 200': (r) => r.status === 200 });
  });

  // Think time: mimics a real applicant reading/typing between steps.
  sleep(Math.random() * 2 + 1);
}
