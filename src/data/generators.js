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
      tilsynsadresse: `${rand(STREET_NAMES)} ${randInt(1, 99)}, ${randInt(1000, 9999)} ${city}`      
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

// Vehicle brands and groups for random generation
const VEHICLE_BRANDS = ['Volvo', 'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Nissan', 'Peugeot', 'Skoda'];
const VEHICLE_GROUPS = ['Personbil', 'Varebil', 'Lastebil', 'Motorsykkel', 'Tilhenger'];
const FUEL_TYPES = ['Bensin', 'Diesel', 'Elektrisk', 'Hybrid', 'Hydrogen'];
const GEARBOX_TYPES = ['Manuell', 'Automat'];
const ENVIRONMENT_CLASSES = ['Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6d-TEMP'];

// Generate random VIN (simplified)
function generateVIN() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  return Array.from({ length: 17 }, () => chars[randInt(0, chars.length - 1)]).join('');
}

// Generate random license plate (Norwegian format)
function generateLicensePlate() {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  return `${letters[randInt(0, letters.length - 1)]}${letters[randInt(0, letters.length - 1)]}${randInt(10000, 99999)}`;
}

// Generate random date between 1990 and today
function randomDateBetween1990AndToday() {
  const start = new Date('1990-01-01');
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTime);
  return `${randomDate.getFullYear()}-${pad(randomDate.getMonth() + 1)}-${pad(randomDate.getDate())}`;
}

// Generate vehicle data (kjoretoy)
export function genKjoretoyFor(orgnr) {
  const vehicleCount = randInt(0, 15);
  
  return Array.from({ length: vehicleCount }).map((_, index) => {
    const isOwner = Math.random() > 0.3;
    const fuelType = rand(FUEL_TYPES);
    const isElectric = fuelType === 'Elektrisk';
    
    // First registration: between 1990 and today
    const firstRegistered = randomDateBetween1990AndToday();
    
    // Last EU control: 5 years after first registration
    const firstRegDate = new Date(firstRegistered);
    const lastEUDate = new Date(firstRegDate);
    lastEUDate.setFullYear(firstRegDate.getFullYear() + 5);
    const lastEUControl = `${lastEUDate.getFullYear()}-${pad(lastEUDate.getMonth() + 1)}-${pad(lastEUDate.getDate())}`;
    
    // Next EU control: 2 years after last EU control
    const nextEUDate = new Date(lastEUDate);
    nextEUDate.setFullYear(lastEUDate.getFullYear() + 2);
    
    // Force at least 1-2 vehicles to have overdue EU control if we have vehicles
    let nextEUControl;
    if (vehicleCount > 0 && (index === 0 || (index === 1 && Math.random() > 0.5))) {
      // Make this vehicle overdue by setting next control to past date
      const overdueDate = new Date();
      overdueDate.setFullYear(overdueDate.getFullYear() - randInt(1, 3)); // 1-3 years overdue
      nextEUControl = `${overdueDate.getFullYear()}-${pad(overdueDate.getMonth() + 1)}-${pad(overdueDate.getDate())}`;
    } else {
      nextEUControl = `${nextEUDate.getFullYear()}-${pad(nextEUDate.getMonth() + 1)}-${pad(nextEUDate.getDate())}`;
    }
    
    return {
      id: `${orgnr}-${index + 1}`,
      eier: isOwner,
      leaser: !isOwner,
      kjennemerke: generateLicensePlate(),
      understellsnummer: generateVIN(),
      forstegangsregistrert: firstRegistered,
      kjoretoygruppe: rand(VEHICLE_GROUPS),
      kjoretoymerke: rand(VEHICLE_BRANDS),
      miljoklasse: isElectric ? null : rand(ENVIRONMENT_CLASSES),
      noxutslipp: isElectric ? 0 : Math.round(Math.random() * 0.1 * 1000) / 1000,
      co2utslipp: isElectric ? 0 : Math.round((80 + Math.random() * 120) * 10) / 10,
      drivstoff: fuelType,
      girkassetype: rand(GEARBOX_TYPES),
      sistEugodkjent: lastEUControl,
      kilometerstand: randInt(5000, 250000),
      kilometerstandSistAvlest: randomDateISOYearAround(),
      heftelser: null,
      nesteEUKontroll: nextEUControl
    };
  });
}