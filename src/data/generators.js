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

// Property data constants
const NORWEGIAN_MUNICIPALITIES = [
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Fredrikstad', 
  'Sandnes', 'Tromsø', 'Sarpsborg', 'Skien', 'Ålesund', 'Sandefjord', 
  'Haugesund', 'Tønsberg', 'Moss', 'Drammen', 'Lillehammer', 'Bodø'
];

const NORWEGIAN_BANKS = [
  'DNB Bank ASA', 'Nordea Bank Abp', 'Handelsbanken', 'Sparebank 1 SR-Bank ASA',
  'Sparebank 1 Nord-Norge', 'Sparebank 1 SMN', 'Kommunalbanken AS', 
  'Cultura Sparebank', 'Sparebanken Vest', 'Sparebank 1 Østlandet'
];

const OWNERSHIP_SHARES = ['1/1', '1/2', '1/3', '2/3', '1/4', '3/4', '1/8', '3/8', '5/8', '7/8'];

// Generate random property data (eiendommer)
export function genEiendommerFor(orgnr) {
  const propertyCount = randInt(0, 8); // 0-8 properties
  
  return Array.from({ length: propertyCount }).map((_, index) => {
    const municipality = rand(NORWEGIAN_MUNICIPALITIES);
    const gaardsnummer = randInt(1, 999).toString();
    const bruksnummer = randInt(1, 99).toString();
    const buildingArea = Math.round((30 + Math.random() * 300) * 10) / 10; // 30-330 m²
    
    // Generate 1-5 teig areas
    const teigCount = randInt(1, 5);
    const teigarealer = Array.from({ length: teigCount }).map(() => 
      Math.round((200 + Math.random() * 2000) * 100) / 100 // 200-2200 m²
    );
    
    // Property value based on building area and location
    const baseValue = buildingArea * (municipality === 'Oslo' ? 80000 : municipality === 'Bergen' ? 60000 : 40000);
    const propertyValue = Math.round(baseValue + (Math.random() * baseValue * 0.5));
    
    // Establishment date between 2010 and 2024
    const establishedDate = randomDateBetween2010AndToday();
    
    // Generate 1-3 mortgage documents
    const mortgageCount = randInt(1, 3);
    const pantedokumenter = Array.from({ length: mortgageCount }).map(() => {
      const mortgageAmount = Math.round(propertyValue * (0.3 + Math.random() * 0.5)); // 30-80% of property value
      const bank = rand(NORWEGIAN_BANKS);
      
      const hasAmountText = Math.random() > 0.4; // 60% chance of having amount text
      
      return {
        beloep: [{
          grunnboksinformasjon: mortgageAmount,
          valuta: 'NOK',
          ...(hasAmountText && { beloeptekst: generateNorwegianAmountText(mortgageAmount) })
        }],
        pantehaver: bank
      };
    });
    
    return {
      grunnboksinformasjon: {
        kommune: municipality,
        gaardsnummer: gaardsnummer,
        bruksnummer: bruksnummer,
        bygningsareal: buildingArea,
        teigarealer: teigarealer
      },
      rettighetshavereTilEiendomsrett: {
        datoHjemmelEiendomsrett: establishedDate,
        vederlag: `${propertyValue.toLocaleString('no-NO')} NOK`,
        eierandel: rand(OWNERSHIP_SHARES)
      },
      pantedokumenter: pantedokumenter,
      harKulturminne: Math.random() < 0.15 // 15% chance of cultural heritage
    };
  });
}

// Helper function for dates between 2010 and today
function randomDateBetween2010AndToday() {
  const start = new Date('2010-01-01');
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTime);
  return `${randomDate.getFullYear()}-${pad(randomDate.getMonth() + 1)}-${pad(randomDate.getDate())}`;
}

// Helper function to generate Norwegian amount text (simplified)
function generateNorwegianAmountText(amount) {
  const millions = Math.floor(amount / 1000000);
  const thousands = Math.floor((amount % 1000000) / 1000);
  const hundreds = Math.floor((amount % 1000) / 100);
  
  let text = '';
  
  if (millions > 0) {
    const millionWords = ['', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni'];
    text += millionWords[millions] || millions.toString();
    text += millions === 1 ? ' million' : ' millioner';
  }
  
  if (thousands > 0) {
    if (text) text += ' ';
    const thousandWords = ['', '', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni'];
    if (thousands < 10) {
      text += thousandWords[thousands] || thousands.toString();
    } else {
      text += thousands.toString();
    }
    text += ' tusen';
  }
  
  if (hundreds > 0) {
    if (text) text += ' ';
    const hundredWords = ['', 'ett', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni'];
    text += hundredWords[hundreds] || hundreds.toString();
    text += ' hundre';
  }
  
  if (text) {
    text += ' kroner';
  } else {
    text = amount.toLocaleString('no-NO') + ' kroner';
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Role data constants
const ROLE_TYPES = ['Daglig leder', 'Styreleder', 'Styremedlem', 'Revisor', 'Prokura'];
const NORWEGIAN_NAMES = [
  'Ola Nordmann', 'Kari Hansen', 'Lars Andersen', 'Anne Johansen', 'Per Olsen',
  'Ingrid Larsen', 'Erik Nilsen', 'Marit Eriksen', 'Bjørn Kristiansen', 'Liv Svendsen',
  'Gunnar Haugen', 'Astrid Berg', 'Rune Dahl', 'Solveig Moen', 'Torstein Lund'
];
const RESPONSIBILITY_AREAS = [
  'Økonomi og finans', 'Personal og HR', 'Salg og markedsføring', 'Drift og produksjon',
  'IT og digitalisering', 'Kvalitet og HMS', 'Strategi og utvikling', 'Kundeservice',
  'Innkjøp og logistikk', 'Forskning og utvikling'
];

// Generate random role data (roller)
export function genRollerFor(orgnr) {
  const roleCount = randInt(3, 12); // 3-12 roles
  const roles = [];
  const usedNames = new Set();
  let hasDagligLeder = false;
  let hasStyreleder = false;
  
  for (let index = 0; index < roleCount; index++) {
    // Determine role type with constraints
    let roleType;
    const availableRoles = ROLE_TYPES.filter(role => {
      if (role === 'Daglig leder' && hasDagligLeder) return false;
      if (role === 'Styreleder' && hasStyreleder) return false;
      return true;
    });
    
    // If no constrained roles available, use remaining roles
    if (availableRoles.length === 0) {
      roleType = rand(['Styremedlem', 'Revisor', 'Prokura']);
    } else {
      roleType = rand(availableRoles);
    }
    
    // Mark unique roles as used
    if (roleType === 'Daglig leder') hasDagligLeder = true;
    if (roleType === 'Styreleder') hasStyreleder = true;
    
    const isActive = Math.random() > 0.2; // 80% chance of being active
    
    // Get unique name
    let name;
    do {
      name = rand(NORWEGIAN_NAMES);
    } while (usedNames.has(name));
    usedNames.add(name);
    
    // Generate start date between 2015 and 2024
    const startDate = randomDateBetween2015AndToday();
    
    // Generate end date for inactive roles
    let endDate = null;
    if (!isActive) {
      const start = new Date(startDate);
      const end = new Date();
      const randomEndTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      const randomEndDate = new Date(randomEndTime);
      endDate = `${randomEndDate.getFullYear()}-${pad(randomEndDate.getMonth() + 1)}-${pad(randomEndDate.getDate())}`;
    }
    
    // Generate date of birth (between 1950 and 1990)
    const birthYear = randInt(1950, 1990);
    const birthMonth = randInt(1, 12);
    const birthDay = randInt(1, 28); // Use 28 to avoid month-specific day issues
    const fodselsdato = `${birthYear}-${pad(birthMonth)}-${pad(birthDay)}`;
    
    // Generate address
    const streetNames = ['Storgata', 'Kirkegata', 'Skolegata', 'Parkveien', 'Bjørkevegen'];
    const address = `${rand(streetNames)} ${randInt(1, 99)}`;
    const postcode = randInt(1000, 9999);
    const cities = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand'];
    const poststed = `${postcode} ${rand(cities)}`;
    
    // Generate responsibility areas (1-3 areas)
    const numAreas = randInt(1, 3);
    const ansvarsomrader = Array.from({ length: numAreas }).map(() => rand(RESPONSIBILITY_AREAS));
    
    const role = {
      navn: name,
      rolle: roleType,
      fodselsdato: fodselsdato,
      aktiv: isActive,
      fraOgMed: startDate,
      tilOgMed: endDate,
      adresse: address,
      poststed: poststed,
      ansvarsomrader: [...new Set(ansvarsomrader)] // Remove duplicates
    };
    
    roles.push(role);
  }
  
  return roles;
}

// Helper function for dates between 2015 and today
function randomDateBetween2015AndToday() {
  const start = new Date('2015-01-01');
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTime);
  return `${randomDate.getFullYear()}-${pad(randomDate.getMonth() + 1)}-${pad(randomDate.getDate())}`;
}