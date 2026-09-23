// Test data builders for the restitution submission journey.
//
// Every record created by these tests MUST be trivially identifiable as
// load-test data so it can be found and purged from Dataverse afterwards.
// We do this by prefixing names/free-text fields with LOAD_TEST_TAG and a
// per-run marker (K6 run id + timestamp), and by never reusing a real
// person's information.
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const LOAD_TEST_TAG = 'K6-LOADTEST';

// Unique per test-run marker so a single execution's records can be found
// and deleted together (e.g. search Dataverse for this value).
export const RUN_MARKER = __ENV.RUN_MARKER || `${Date.now()}`;

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
const LAST_NAMES = ['Sample', 'Synthetic', 'Placeholder', 'Fixture'];
const CITIES = ['Victoria', 'Vancouver', 'Kelowna', 'Prince George'];

function taggedName(prefix) {
  return `${LOAD_TEST_TAG}-${prefix}-${RUN_MARKER}-${randomIntBetween(1000, 9999)}`;
}

function person() {
  return {
    firstName: taggedName(randomItem(FIRST_NAMES)),
    lastName: taggedName(randomItem(LAST_NAMES)),
  };
}

function baseApplication() {
  const p = person();
  return {
    MiddleName: '',
    OtherFirstName: '',
    OtherLastName: '',
    Gender: null,
    IndigenousStatus: null,
    PreferredMethodOfContact: 1,
    // These are Dataverse option-set integer values, not booleans - see
    // Database/OptionSets/VSd_YesNo.cs (No=100000000/Yes=100000001) and
    // Database/OptionSets/VSd_VoiceMailOption.cs (None=100000003). Passing
    // 0/1 here throws ArgumentOutOfRangeException server-side because 0/1
    // aren't defined members of those enums.
    SmsPreferred: 100000000, // VSd_YesNo.No
    PrimaryPhoneNumber: '2505550100',
    AlternatePhoneNumber: '',
    Email: 'k6-loadtest@example.invalid',
    PrimaryAddressLine1: `${randomIntBetween(100, 999)} ${LOAD_TEST_TAG} St`,
    PrimaryAddressLine2: '',
    PrimaryAddressLine3: '',
    PrimaryCity: randomItem(CITIES),
    PrimaryProvince: 'BC',
    PrimaryPostalCode: 'V8V8V8',
    PrimaryCountry: 'Canada',
    OffenderFirstName: taggedName('OffenderFirst'),
    OffenderMiddleName: '',
    OffenderLastName: taggedName('OffenderLast'),
    VoicemailOption: 100000003, // VSd_VoiceMailOption.None
    Signature: `${LOAD_TEST_TAG}-signature-${RUN_MARKER}`,
    DeclarationFullName: `${p.firstName} ${p.lastName}`,
    SigningOfficerTitle: '',
    DeclarationDate: new Date().toISOString(),
    ContactTitle: '',
    OffenderCustodyLocation: '',
    GenderIdentityText: '',
    PrimaryRaceEthnicity: null,
    PrimaryRaceEthnicityText: '',
    Pronouns: null,
    PronounsText: '',
  };
}

function courtInfoCollection() {
  return [
    {
      CourtFileNumber: `${LOAD_TEST_TAG}-${RUN_MARKER}`,
      CourtLocation: 'Victoria',
    },
  ];
}

function providerCollection() {
  return [];
}

function documentCollection() {
  return [];
}

// POST /api/restitutions/victim
export function buildVictimRestitutionPayload() {
  const p = person();
  return {
    Application: {
      ...baseApplication(),
      FirstName: p.firstName,
      LastName: p.lastName,
      BirthDate: '1990-01-01T00:00:00Z',
    },
    CourtInfoCollection: courtInfoCollection(),
    ProviderCollection: providerCollection(),
    DocumentCollection: documentCollection(),
  };
}

// POST /api/restitutions/offender
export function buildOffenderRestitutionPayload() {
  const p = person();
  return {
    Application: {
      ...baseApplication(),
      FirstName: p.firstName,
      LastName: p.lastName,
      BirthDate: '1990-01-01T00:00:00Z',
    },
    CourtInfoCollection: courtInfoCollection(),
    ProviderCollection: providerCollection(),
    DocumentCollection: documentCollection(),
  };
}

// POST /api/restitutions/victim-entity
export function buildVictimEntityRestitutionPayload() {
  return {
    Application: {
      ...baseApplication(),
      EntityName: taggedName('Entity'),
    },
    CourtInfoCollection: courtInfoCollection(),
    ProviderCollection: providerCollection(),
    DocumentCollection: documentCollection(),
  };
}
