import { 
  AUTHORITIES, 
  THEMES, 
  REACTIONS, 
  CITIES, 
  STREET_NAMES, 
  COMPANY_NAMES, 
  NACE_CODES, 
  ORGANIZATION_FORMS, 
  MESSAGE_TYPES 
} from '../constants.js';
import { rand, randInt, pad } from '../utils/randomHelpers.js';
import { randomDateISOYearAround, randomFutureDateISO } from '../utils/dateHelpers.js';

/**
 * Data generation functions for creating dummy supervision data
 */

// Generate supervision coordination data
export function genTilsynskoordineringFor(orgnr) {
  const n = randInt(1, 100);
  
  return Array.from({ length: n }).map(() => {
    const start = randomFutureDateISO(1, 9);
    const startD = new Date(start);
    const endD = new Date(startD);
    endD.setDate(startD.getDate() + randInt(0, 10));
    const slutt = Math.random() > 0.5 ? `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}` : undefined;
    const city = rand(CITIES);
    return {
      tilsynsmyndighet: rand(AUTHORITIES),
      organisasjonsnummer: orgnr,
      tilsynstema: rand(THEMES),
      startdato: start,
      sluttdato: slutt,
      kontrolladresse: `${rand(STREET_NAMES)} ${randInt(1, 99)}, ${randInt(1000, 9999)} ${city}`,
      tilsynsaktivitet: Math.random() > 0.5 ? "Tilsyn" : "Kampanje",
      varighet_timer: randInt(1, 8),
    };
  });
}

// Generate supervision reports
export function genTilsynsrapportFor(orgnr) {
  const n = randInt(1, 100);
  
  return Array.from({ length: n }).map(() => {
    const city = rand(CITIES);
    return {
      tilsynsmyndighet: rand(AUTHORITIES),
      organisasjonsnummer: orgnr,
      dato: randomDateISOYearAround(),
      funn_alvorlighetsgrad: rand([
        "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen", "Ingen",
        "Lav", "Lav", "Lav", "Lav","Lav", "Lav",
        "Medium", "Medium",
        "Høy"
      ]),
      reaksjonstype: rand(REACTIONS),
      tema: rand(THEMES),
      tilsynsadresse: `${rand(STREET_NAMES)} ${randInt(1, 99)}, ${randInt(1000, 9999)} ${city}`,
    };
  });
}

// Generate messages from other authorities
export function genMeldingerFor(orgnr) {
  const n = randInt(2, 30);
  return Array.from({ length: n }).map((_, idx) => ({
    identifikator: `MSG-${orgnr}-${String(idx + 1).padStart(3, '0')}`,
    mottaker: rand(AUTHORITIES),
    meldingOmTildaenhet: orgnr,
    datoForMeldingTilAnnenMyndighet: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    meldingsinnholdTilAnnenMyndighet: {
      meldingsType: rand(MESSAGE_TYPES),
      fritekst: `Automatisk generert melding vedrørende ${rand(THEMES).toLowerCase()} for organisasjon ${orgnr}. ${rand(['Vennligst følg opp innen 30 dager.', 'Krever umiddelbar oppmerksomhet.', 'Til orientering og videre koordinering.', 'Forespørsel om tilleggsopplysninger.'])}`
    }
  }));
}

// Generate organization details
export function genOrganisationDetailsFor(orgnr) {
  const selectedNace = rand(NACE_CODES);
  const city = rand(CITIES);
  
  return {
    name: rand(COMPANY_NAMES),
    address: `${rand(STREET_NAMES)} ${randInt(1, 99)}`,
    zipcode: `${randInt(1000, 9999)}`,
    city: city,
    naceCode: selectedNace.code,
    naceCodeName: selectedNace.name,
    organisationForm: rand(ORGANIZATION_FORMS),
    organisasjonsnummer: orgnr,
  };
}