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
import { randomDateISOYearAround, randomFutureDateISO, randomDateInRange } from '../utils/dateHelpers.js';

/**
 * Data generation functions for creating dummy supervision data
 */

// Contact person names for koordinering
const KOORD_FIRST_NAMES = ['Erik', 'Anne', 'Lars', 'Kari', 'Ole', 'Ingrid', 'Per', 'Marit', 'Bjørn', 'Hilde', 'Tor', 'Silje', 'Geir', 'Lise', 'Arne'];
const KOORD_LAST_NAMES = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen'];
const KOORD_EMAIL_DOMAINS = ['tilsynet.no', 'kontroll.no', 'myndighet.no', 'stat.no', 'forvaltning.no'];

// Generate supervision coordination data (planned/future tilsyn)
export function genTilsynskoordineringFor(orgnr) {
  const n = randInt(0, 5); // Lower number: 0-5 planned tilsyn
  
  return Array.from({ length: n }).map(() => {
    const start = randomFutureDateISO(1, 9);
    const startD = new Date(start);
    const endD = new Date(startD);
    endD.setDate(startD.getDate() + randInt(0, 10));
    const slutt = Math.random() > 0.5 ? `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}` : undefined;
    const city = rand(CITIES);
    const firstName = rand(KOORD_FIRST_NAMES);
    const lastName = rand(KOORD_LAST_NAMES);
    const useEmail = Math.random() > 0.3;
    const contactInfo = useEmail 
      ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${rand(KOORD_EMAIL_DOMAINS)}`
      : `+47 ${randInt(400, 499)} ${randInt(10, 99)} ${randInt(100, 999)}`;
    
    return {
      tilsynsmyndighet: rand(AUTHORITIES),
      organisasjonsnummer: orgnr,
      tilsynstema: rand(THEMES),
      startdato: start,
      sluttdato: slutt,
      kontrolladresse: `${rand(STREET_NAMES)} ${randInt(1, 99)}, ${randInt(1000, 9999)} ${city}`,
      tilsynsaktivitet: Math.random() > 0.5 ? "Tilsyn" : "Kampanje",
      varighet_timer: randInt(1, 8),
      kontaktperson: {
        navn: `${firstName} ${lastName}`,
        kontaktinfo: contactInfo
      }
    };
  });
}

// Contact person names for tilsyn
const FIRST_NAMES = ['Erik', 'Anne', 'Lars', 'Kari', 'Ole', 'Ingrid', 'Per', 'Marit', 'Bjørn', 'Hilde', 'Tor', 'Silje', 'Geir', 'Lise', 'Arne'];
const LAST_NAMES = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen'];
const EMAIL_DOMAINS = ['tilsynet.no', 'kontroll.no', 'myndighet.no', 'stat.no', 'forvaltning.no'];

// Generate supervision reports
export function genTilsynsrapportFor(orgnr, fromDate = null, toDate = null) {
  const reports = [];
  
  // Determine date range
  const startDate = fromDate ? new Date(fromDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 10));
  const endDate = toDate ? new Date(toDate) : new Date();
  
  // Calculate number of years in range
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  // Select 1-5 authorities for the ENTIRE time interval
  const numAuthorities = randInt(1, 5);
  const shuffledAuthorities = [...AUTHORITIES].sort(() => Math.random() - 0.5);
  const selectedAuthorities = shuffledAuthorities.slice(0, numAuthorities);
  
  // Generate tilsyn year by year
  for (let year = startYear; year <= endYear; year++) {
    // Each authority has 0-1 tilsyn per year (lower frequency)
    selectedAuthorities.forEach(authority => {
      const tilsynCount = Math.random() < 0.5 ? 1 : 0; // 50% chance of 1 tilsyn, 50% chance of 0
      
      for (let i = 0; i < tilsynCount; i++) {
        // Generate random date within this year (respecting fromDate/toDate bounds)
        const yearStart = new Date(Math.max(new Date(`${year}-01-01`).getTime(), startDate.getTime()));
        const yearEnd = new Date(Math.min(new Date(`${year}-12-31`).getTime(), endDate.getTime()));
        
        if (yearStart > yearEnd) continue;
        
        const randomTime = yearStart.getTime() + Math.random() * (yearEnd.getTime() - yearStart.getTime());
        const tilsynDate = new Date(randomTime);
        const dato = `${tilsynDate.getFullYear()}-${pad(tilsynDate.getMonth() + 1)}-${pad(tilsynDate.getDate())}`;
        
        const city = rand(CITIES);
        const firstName = rand(FIRST_NAMES);
        const lastName = rand(LAST_NAMES);
        const useEmail = Math.random() > 0.3;
        const contactInfo = useEmail 
          ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${rand(EMAIL_DOMAINS)}`
          : `+47 ${randInt(400, 499)} ${randInt(10, 99)} ${randInt(100, 999)}`;
        
        // Generate multiple brudd/funn (0-3 per tilsyn)
        // ~60% chance of no brudd, ~25% chance of 1, ~10% chance of 2, ~5% chance of 3
        const bruddCountRoll = Math.random();
        let bruddCount;
        if (bruddCountRoll < 0.60) {
          bruddCount = 0;
        } else if (bruddCountRoll < 0.85) {
          bruddCount = 1;
        } else if (bruddCountRoll < 0.95) {
          bruddCount = 2;
        } else {
          bruddCount = 3;
        }
        
        const funn = [];
        for (let j = 0; j < bruddCount; j++) {
          // Severity distribution for each brudd
          const severityRoll = Math.random();
          let alvorlighetsgrad;
          if (severityRoll < 0.50) {
            alvorlighetsgrad = "Lav";
          } else if (severityRoll < 0.85) {
            alvorlighetsgrad = "Medium";
          } else {
            alvorlighetsgrad = "Høy";
          }
          
          funn.push({
            alvorlighetsgrad: alvorlighetsgrad,
            reaksjonstype: rand(REACTIONS),
            beskrivelse: rand([
              'Manglende dokumentasjon',
              'Avvik fra forskrift',
              'Brudd på internkontroll',
              'Manglende opplæring',
              'Feil i rapportering',
              'Avvik fra godkjenning',
              'Manglende vedlikehold',
              'Brudd på HMS-krav'
            ])
          });
        }
        
        reports.push({
          tilsynsmyndighet: authority,
          organisasjonsnummer: orgnr,
          dato: dato,
          funn: funn,
          // Keep legacy fields for backwards compatibility
          funn_alvorlighetsgrad: funn.length > 0 ? funn.reduce((max, f) => {
            const order = { 'Høy': 3, 'Medium': 2, 'Lav': 1 };
            return order[f.alvorlighetsgrad] > order[max] ? f.alvorlighetsgrad : max;
          }, 'Lav') : "Ingen",
          reaksjonstype: funn.length > 0 ? funn[0].reaksjonstype : "Ingen",
          tema: rand(THEMES),
          tilsynsadresse: `${rand(STREET_NAMES)} ${randInt(1, 99)}, ${randInt(1000, 9999)} ${city}`,
          varpisel: rand(['Nei', 'Nei', 'Nei', 'Ja', 'Ikke angitt']),
          kontaktperson: {
            navn: `${firstName} ${lastName}`,
            kontaktinfo: contactInfo
          },
          status: rand(['Gjennomført', 'Gjennomført', 'Gjennomført', 'Gjennomført', 'Under oppfølging']),
          rapportUrl: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
        });
      }
    });
  }
  
  // Sort by date descending
  return reports.sort((a, b) => b.dato.localeCompare(a.dato));
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
export function genOrganisationDetailsFor(orgnr, presetName = null) {
  const selectedNace = rand(NACE_CODES);
  const city = rand(CITIES);
  
  return {
    name: presetName || rand(COMPANY_NAMES),
    address: `${rand(STREET_NAMES)} ${randInt(1, 99)}`,
    zipcode: `${randInt(1000, 9999)}`,
    city: city,
    naceCode: selectedNace.code,
    naceCodeName: selectedNace.name,
    organisationForm: rand(ORGANIZATION_FORMS),
    organisasjonsnummer: orgnr,
  };
}

// Subsidiary/holding company name suffixes
const SUBSIDIARY_SUFFIXES = ['Holding', 'Invest', 'Eiendom', 'Drift', 'Produksjon', 'Service', 'Logistikk', 'Teknologi', 'Konsult', 'Finans'];
const SUBSIDIARY_PREFIXES = ['Nordic', 'Norsk', 'Skandinavisk', 'Bergen', 'Oslo', 'Trondheim', 'Vest', 'Øst', 'Nord', 'Sør'];

// Generate related companies (either parent or subsidiaries)
export function genRelatedCompaniesFor(orgnr, orgName) {
  // 50% chance of having a parent company, 50% chance of having subsidiaries
  const hasParent = Math.random() < 0.5;
  
  if (hasParent) {
    // Generate one parent company - always starts with 9
    const parentOrgnr = '9' + String(randInt(10000000, 99999999));
    const baseName = orgName ? orgName.replace(/ AS$| ASA$/, '') : rand(COMPANY_NAMES).replace(/ AS$| ASA$/, '');
    const parentName = `${baseName} ${rand(SUBSIDIARY_SUFFIXES)} AS`;
    const zipcode = String(randInt(1000, 9999));
    const city = rand(CITIES);
    
    return {
      type: 'parent',
      companies: [{
        organisasjonsnummer: parentOrgnr,
        name: parentName,
        relationship: 'Morselskap',
        address: `${rand(STREET_NAMES)} ${randInt(1, 99)}`,
        zipcode: zipcode,
        city: city
      }]
    };
  } else {
    // Generate 0-5 subsidiaries
    const count = randInt(0, 5);
    const subsidiaries = [];
    const usedOrgnrs = new Set([orgnr]);
    
    for (let i = 0; i < count; i++) {
      let subOrgnr;
      do {
        // Subsidiaries start with 8 or 9
        const prefix = rand(['8', '9']);
        subOrgnr = prefix + String(randInt(10000000, 99999999));
      } while (usedOrgnrs.has(subOrgnr));
      usedOrgnrs.add(subOrgnr);
      
      const baseName = orgName ? orgName.replace(/ AS$| ASA$/, '') : rand(COMPANY_NAMES).replace(/ AS$| ASA$/, '');
      const subName = `${baseName} ${rand(SUBSIDIARY_SUFFIXES)} AS`;
      const zipcode = String(randInt(1000, 9999));
      const city = rand(CITIES);
      
      subsidiaries.push({
        organisasjonsnummer: subOrgnr,
        name: subName,
        relationship: 'Datterselskap',
        address: `${rand(STREET_NAMES)} ${randInt(1, 99)}`,
        zipcode: zipcode,
        city: city
      });
    }
    
    return {
      type: 'subsidiaries',
      companies: subsidiaries
    };
  }
}

// Vehicle brands and groups for random generation
const VEHICLE_BRANDS = ['Volvo', 'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Nissan', 'Peugeot', 'Skoda'];
const TRAILER_BRANDS = ['Gaupen', 'Tysse', 'Ifor Williams', 'Tredal'];
const VEHICLE_GROUPS = ['Personbil', 'Varebil', 'Lastebil', 'Motorsykkel', 'Tilhenger'];
const FUEL_TYPES = ['Bensin', 'Diesel', 'Elektrisk', 'Hybrid', 'Hydrogen'];
const GEARBOX_TYPES = ['Manuell', 'Automat'];

// Environment classes mapped to fuel types
// Euro 6d and Euro 6d-TEMP are diesel-specific standards
// Euro 4, 5, 6 apply to both petrol and diesel
const ENVIRONMENT_CLASSES_DIESEL = ['Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6d-TEMP'];
const ENVIRONMENT_CLASSES_PETROL = ['Euro 4', 'Euro 5', 'Euro 6'];
const ENVIRONMENT_CLASSES_HYBRID = ['Euro 6', 'Euro 6d-TEMP']; // Hybrids typically meet newer standards

// Get appropriate environment class based on fuel type
function getEnvironmentClass(fuelType) {
  switch (fuelType) {
    case 'Diesel':
      return rand(ENVIRONMENT_CLASSES_DIESEL);
    case 'Bensin':
      return rand(ENVIRONMENT_CLASSES_PETROL);
    case 'Hybrid':
      return rand(ENVIRONMENT_CLASSES_HYBRID);
    case 'Elektrisk':
    case 'Hydrogen':
      return null; // Zero emission vehicles don't have Euro classification
    default:
      return null;
  }
}

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
    const vehicleGroup = rand(VEHICLE_GROUPS);
    const isTrailer = vehicleGroup === 'Tilhenger';
    const fuelType = isTrailer ? null : rand(FUEL_TYPES);
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
    
    // ~20% chance of overdue EU control on average, with some statistical variance
    // Use a random threshold that varies slightly to allow for anomalies
    let nextEUControl;
    const overdueChance = 0.15 + Math.random() * 0.1; // 15-25% chance, averaging ~20%
    if (Math.random() < overdueChance) {
      // Make this vehicle overdue by setting next control to past date
      const overdueDate = new Date();
      overdueDate.setMonth(overdueDate.getMonth() - randInt(1, 24)); // 1-24 months overdue
      nextEUControl = `${overdueDate.getFullYear()}-${pad(overdueDate.getMonth() + 1)}-${pad(overdueDate.getDate())}`;
    } else {
      nextEUControl = `${nextEUDate.getFullYear()}-${pad(nextEUDate.getMonth() + 1)}-${pad(nextEUDate.getDate())}`;
    }
    
    // Base vehicle data
    const baseData = {
      id: `${orgnr}-${index + 1}`,
      eier: isOwner,
      leaser: !isOwner,
      kjennemerke: generateLicensePlate(),
      understellsnummer: generateVIN(),
      forstegangsregistrert: firstRegistered,
      kjoretoygruppe: vehicleGroup,
      sistEugodkjent: lastEUControl,
      heftelser: null,
      nesteEUKontroll: nextEUControl
    };
    
    // Trailer-specific data (no miljøklasse, girkasse, drivstoff, kilometerstand, EU-kontroll)
    if (isTrailer) {
      return {
        id: `${orgnr}-${index + 1}`,
        eier: isOwner,
        leaser: !isOwner,
        kjennemerke: generateLicensePlate(),
        understellsnummer: generateVIN(),
        forstegangsregistrert: firstRegistered,
        kjoretoygruppe: vehicleGroup,
        kjoretoymerke: rand(TRAILER_BRANDS),
        egenvekt: randInt(50, 450), // 50-450 kg for trailers
        tillattTotalvekt: randInt(500, 3500), // 500-3500 kg
        heftelser: null,
      };
    }
    
    // Get vehicle weight based on type
    const getVehicleWeight = (group) => {
      switch (group) {
        case 'Personbil':
          return randInt(1300, 2600); // 1300-2600 kg for cars
        case 'Varebil':
          return randInt(1800, 3500); // 1800-3500 kg for vans
        case 'Lastebil':
          return randInt(5000, 18000); // 5000-18000 kg for trucks
        case 'Motorsykkel':
          return randInt(150, 400); // 150-400 kg for motorcycles
        default:
          return randInt(1300, 2600);
      }
    };
    
    // Regular vehicle data
    const isZeroEmission = fuelType === 'Elektrisk' || fuelType === 'Hydrogen';
    const gearboxType = isZeroEmission ? 'Automat' : rand(GEARBOX_TYPES);
    return {
      ...baseData,
      kjoretoymerke: rand(VEHICLE_BRANDS),
      egenvekt: getVehicleWeight(vehicleGroup),
      miljoklasse: getEnvironmentClass(fuelType),
      noxutslipp: isZeroEmission ? 0 : Math.round(Math.random() * 0.1 * 1000) / 1000,
      co2utslipp: isZeroEmission ? 0 : Math.round((80 + Math.random() * 120) * 10) / 10,
      drivstoff: fuelType,
      girkassetype: gearboxType,
      kilometerstand: randInt(5000, 250000),
      kilometerstandSistAvlest: randomDateISOYearAround(),
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

const OWNERSHIP_SHARES = ['1/1','1/1','1/1','1/1','1/1','1/1','1/1','1/1','1/1','1/1', '1/2','1/2','1/2','1/2','1/2','1/2','1/2','1/2', '1/3', '2/3', '1/4', '3/4', '1/8', '3/8', '5/8', '7/8'];

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
      
      // Always generate textual description without numbers
      const beloeptekst = generateTextualAmountDescription(mortgageAmount);
      
      return {
        beloep: [{
          grunnboksinformasjon: mortgageAmount,
          valuta: 'NOK',
          beloeptekst: beloeptekst
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

// Helper function to generate textual amount descriptions without numbers
function generateTextualAmountDescription(amount) {
  const descriptions = [
    'Betydelig lånebeløp for eiendomsfinansiering',
    'Standardlån for boligkjøp',
    'Større finansieringsbeløp for næringseiendom',
    'Typisk boliglån for privatperson',
    'Omfattende lånearrangement for eiendomsinvestering',
    'Vanlig finansiering for boligutvikler',
    'Substansielt lånebeløp for kommersiell eiendom',
    'Ordinært boliglån med sikkerhet i fast eiendom',
    'Betydelig finansiering for eiendomsprosjekt',
    'Standardisert låneavtale for boligformål',
    'Større investeringslån for næringseiendom',
    'Typisk refinansieringsbeløp for eksisterende eiendom'
  ];
  
  return rand(descriptions);
}

// Role data constants
const ROLE_TYPES = ['Daglig leder', 'Styreleder', 'Styremedlem', 'Revisor', 'Regnskapsfører', 'Prokura'];
const NORWEGIAN_NAMES = [
  'Ola Nordmann', 'Kari Hansen', 'Lars Andersen', 'Anne Johansen', 'Per Olsen',
  'Ingrid Larsen', 'Erik Nilsen', 'Marit Eriksen', 'Bjørn Kristiansen', 'Liv Svendsen',
  'Gunnar Haugen', 'Astrid Berg', 'Rune Dahl', 'Solveig Moen', 'Torstein Lund'
];
const REVISOR_COMPANIES = [
  'PwC Norge', 'Deloitte Norge', 'KPMG Norge', 'EY Norge', 'BDO Norge',
  'Grant Thornton Norge', 'Mazars Norge', 'RSM Norge', 'Crowe Norge', 'Moore Norge'
];
const REGNSKAPSFORER_COMPANIES = [
  'Azets Insight AS', 'Accountor AS', 'Visma Regnskap AS', 'Sparebank 1 Regnskapshuset',
  'Sticos AS', 'Økonor AS', 'Amesto AccountHouse AS', 'Regnskap Norge Partner AS',
  'Duett Regnskap AS', 'Conta AS'
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
  let hasRevisor = false;
  let hasRegnskapsforer = false;
  
  for (let index = 0; index < roleCount; index++) {
    // Determine role type with constraints
    let roleType;
    const availableRoles = ROLE_TYPES.filter(role => {
      if (role === 'Daglig leder' && hasDagligLeder) return false;
      if (role === 'Styreleder' && hasStyreleder) return false;
      if (role === 'Revisor' && hasRevisor) return false;
      if (role === 'Regnskapsfører' && hasRegnskapsforer) return false;
      return true;
    });
    
    // If no constrained roles available, use remaining roles
    if (availableRoles.length === 0) {
      roleType = rand(['Styremedlem', 'Prokura']);
    } else {
      roleType = rand(availableRoles);
    }
    
    // Mark unique roles as used
    if (roleType === 'Daglig leder') hasDagligLeder = true;
    if (roleType === 'Styreleder') hasStyreleder = true;
    if (roleType === 'Revisor') hasRevisor = true;
    if (roleType === 'Regnskapsfører') hasRegnskapsforer = true;
    
    const isActive = Math.random() > 0.2; // 80% chance of being active
    
    // Get unique name (use company name for revisor/regnskapsfører, person name for others)
    let name;
    if (roleType === 'Revisor') {
      name = rand(REVISOR_COMPANIES);
    } else if (roleType === 'Regnskapsfører') {
      name = rand(REGNSKAPSFORER_COMPANIES);
    } else {
      do {
        name = rand(NORWEGIAN_NAMES);
      } while (usedNames.has(name));
      usedNames.add(name);
    }
    
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

// Financial data constants
const COMPANY_SECTORS = [
  { bransje: 'Teknologi og IT-tjenester', naceKode: '62.010' },
  { bransje: 'Konsulentvirksomhet', naceKode: '70.220' },
  { bransje: 'Bygg og anlegg', naceKode: '41.200' },
  { bransje: 'Handel og service', naceKode: '47.190' },
  { bransje: 'Transport og logistikk', naceKode: '49.410' },
  { bransje: 'Produksjon og industri', naceKode: '25.620' }
];

const CREDIT_RATINGS = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB'];
const RISK_LEVELS = ['Meget lav', 'Lav', 'Moderat', 'Høy', 'Meget høy'];
const PAYMENT_ABILITY = ['Utmerket', 'God', 'Tilfredsstillende', 'Svak', 'Dårlig'];
const FINANCIAL_STABILITY = ['Meget sterk', 'Sterk', 'God', 'Svak', 'Dårlig'];
const QUARTILE_POSITIONS = ['Øvre kvartil', 'Median', 'Nedre kvartil'];
const TREND_DIRECTIONS = ['Meget positiv', 'Positiv', 'Stabil', 'Negativ', 'Meget negativ'];

// Generate random financial data (økonomisk informasjon)
export function genOkInfoFor(orgnr, orgDetails = null) {
  const currentYear = new Date().getFullYear();
  
  // Use orgDetails if provided, otherwise use random sector
  const sector = orgDetails ? 
    { bransje: orgDetails.naceCodeName, naceKode: orgDetails.naceCode } : 
    rand(COMPANY_SECTORS);
  
  const companyNames = [
    'Nordisk Teknologi AS', 'Innovasjon Norge AS', 'Fjord Consulting AS',
    'Bergen Solutions AS', 'Oslo Digital AS', 'Trondheim Tech AS',
    'Stavanger Services AS', 'Arctic Innovation AS', 'Nordic Systems AS'
  ];
  
  // ~30% chance of being a gazelle organization (only if AS/Aksjeselskap)
  const isAS = orgDetails?.organisationForm === 'Aksjeselskap' || orgDetails?.organisationForm === 'AS';
  const isGazelleCandidate = isAS && Math.random() < 0.30;
  
  // Base financial metrics (will be adjusted year by year)
  // For gazelle: start with lower revenue that will double over 5 years
  const baseRevenue = isGazelleCandidate 
    ? randInt(2000000, 20000000) // 2M - 20M starting (will double to 4M-40M+)
    : randInt(10000000, 100000000); // 10M - 100M NOK
  const baseEmployees = randInt(15, 200);
  // For gazelle: ensure positive profit margin
  const baseProfitMargin = isGazelleCandidate 
    ? 10 + Math.random() * 15 // 10-25% for gazelle (always positive)
    : 8 + Math.random() * 12; // 8-20% profit margin
  
  // Generate 5 years of data (current year - 4 to current year)
  const regnskapsaar = [];
  
  // For gazelle: calculate annual growth rate needed to at least double over 5 years
  // To double in 5 years: (1 + r)^5 >= 2, so r >= 0.1487 (~15% per year)
  const gazelleAnnualGrowth = 0.15 + Math.random() * 0.10; // 15-25% annual growth for gazelle
  
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const isLatestYear = i === 0;
    
    // Apply growth/decline trends
    let growthFactor;
    if (isGazelleCandidate) {
      // Gazelle: consistent positive growth each year (compound from year 0)
      const yearsFromStart = 4 - i;
      growthFactor = Math.pow(1 + gazelleAnnualGrowth, yearsFromStart);
    } else {
      // Normal: random growth/decline
      growthFactor = Math.pow(1 + (Math.random() * 0.3 - 0.1), 4 - i); // -10% to +20% annual growth
    }
    const revenue = Math.round(baseRevenue * growthFactor);
    const employees = Math.round(baseEmployees * Math.pow(1 + (Math.random() * 0.2 - 0.05), 4 - i));
    
    // Calculate derived metrics
    const profitMargin = baseProfitMargin + (Math.random() * 6 - 3); // ±3% variation
    const operatingResult = Math.round(revenue * (profitMargin / 100));
    const resultBeforeTax = Math.round(operatingResult * (0.85 + Math.random() * 0.1));
    const resultAfterTax = Math.round(resultBeforeTax * 0.78); // ~22% tax rate
    
    // Balance sheet items
    const totalCapital = Math.round(revenue * (0.4 + Math.random() * 0.6)); // 40-100% of revenue
    const equityRatio = 30 + Math.random() * 40; // 30-70%
    const equity = Math.round(totalCapital * (equityRatio / 100));
    const totalDebt = totalCapital - equity;
    const shortTermDebt = Math.round(totalDebt * (0.3 + Math.random() * 0.4));
    const longTermDebt = totalDebt - shortTermDebt;
    
    // Employee costs
    const avgSalary = 450000 + Math.random() * 350000; // 450k - 800k NOK
    const totalSalaries = Math.round(employees * avgSalary);
    const socialCosts = Math.round(totalSalaries * 0.18);
    const pensionCosts = Math.round(totalSalaries * 0.06);
    const totalPersonnelCosts = totalSalaries + socialCosts + pensionCosts;
    
    // Depreciation
    const depreciation = Math.round(revenue * (0.03 + Math.random() * 0.04)); // 3-7% of revenue
    
    // Working capital
    const workingCapital = Math.round(revenue * (0.1 + Math.random() * 0.2));
    
    // Liquidity ratios
    const liquidityGrade1 = 1.5 + Math.random() * 2; // 1.5 - 3.5
    const liquidityGrade2 = liquidityGrade1 * (0.7 + Math.random() * 0.2);
    
    // Cash flows
    const operatingCashFlow = Math.round(operatingResult + depreciation + (Math.random() * revenue * 0.05));
    const investingCashFlow = -Math.round(depreciation * (0.8 + Math.random() * 1.5));
    const financingCashFlow = -Math.round(Math.abs(investingCashFlow) * (0.2 + Math.random() * 0.6));
    
    // Calculate year-over-year changes
    const revenueChange = i === 4 ? Math.random() * 20 - 5 : 
      regnskapsaar.length > 0 ? ((revenue - regnskapsaar[regnskapsaar.length - 1].finansielleNokkeltal.omsetning.beloep) / regnskapsaar[regnskapsaar.length - 1].finansielleNokkeltal.omsetning.beloep * 100) : 0;
    
    const operatingChange = i === 4 ? Math.random() * 30 - 10 :
      regnskapsaar.length > 0 ? ((operatingResult - regnskapsaar[regnskapsaar.length - 1].finansielleNokkeltal.driftsresultat.beloep) / regnskapsaar[regnskapsaar.length - 1].finansielleNokkeltal.driftsresultat.beloep * 100) : 0;
    
    regnskapsaar.push({
      aar: year,
      regnskapsperiode: {
        fraOgMed: `${year}-01-01`,
        tilOgMed: `${year}-12-31`
      },
      finansielleNokkeltal: {
        omsetning: {
          beloep: revenue,
          valuta: 'NOK',
          endringFraForrigeAar: Math.round(revenueChange * 10) / 10
        },
        driftsresultat: {
          beloep: operatingResult,
          valuta: 'NOK',
          margin: Math.round(profitMargin * 10) / 10,
          endringFraForrigeAar: Math.round(operatingChange * 10) / 10
        },
        resultatForSkatt: {
          beloep: resultBeforeTax,
          valuta: 'NOK',
          endringFraForrigeAar: Math.round(operatingChange * 0.9 * 10) / 10
        },
        resultatEtterSkatt: {
          beloep: resultAfterTax,
          valuta: 'NOK',
          endringFraForrigeAar: Math.round(operatingChange * 0.9 * 10) / 10
        },
        totalkapital: {
          beloep: totalCapital,
          valuta: 'NOK',
          endringFraForrigeAar: Math.round((Math.random() * 20 - 5) * 10) / 10
        },
        egenkapital: {
          beloep: equity,
          valuta: 'NOK',
          egenkapitalandel: Math.round(equityRatio * 10) / 10,
          endringFraForrigeAar: Math.round((Math.random() * 25 - 5) * 10) / 10
        },
        gjeld: {
          kortsiktigGjeld: shortTermDebt,
          langsiktigGjeld: longTermDebt,
          totalGjeld: totalDebt,
          gjeldsgrad: Math.round((100 - equityRatio) * 10) / 10
        },
        avskrivninger: {
          beloep: depreciation,
          valuta: 'NOK',
          prosentAvOmsetning: Math.round((depreciation / revenue * 100) * 10) / 10
        },
        arbeidskapital: {
          beloep: workingCapital,
          valuta: 'NOK'
        }
      },
      loennsomhetsnoekkeltal: {
        bruttomargin: Math.round((profitMargin + 40 + Math.random() * 20) * 10) / 10,
        driftsmargin: Math.round(profitMargin * 10) / 10,
        nettemargin: Math.round((profitMargin * 0.78) * 10) / 10,
        egenkapitalrentabilitet: Math.round((resultAfterTax / equity * 100) * 10) / 10,
        totalkapitalrentabilitet: Math.round((operatingResult / totalCapital * 100) * 10) / 10,
        omloepshastighet: Math.round((revenue / totalCapital) * 100) / 100
      },
      likviditetsnoekkeltal: {
        likviditetsgrad1: Math.round(liquidityGrade1 * 100) / 100,
        likviditetsgrad2: Math.round(liquidityGrade2 * 100) / 100,
        kontantstroemDrift: operatingCashFlow,
        kontantstroemInvestering: investingCashFlow,
        kontantstroemFinansiering: financingCashFlow
      },
      ansatte: {
        antallAnsatte: employees,
        heltidsansatte: Math.round(employees * (0.85 + Math.random() * 0.1)),
        deltidsansatte: Math.round(employees * (0.05 + Math.random() * 0.1)),
        midlertidigAnsatte: Math.round(employees * (0.02 + Math.random() * 0.08)),
        gjennomsnittligAntallAnsatte: Math.round(employees * (0.95 + Math.random() * 0.1)),
        loennskostnader: {
          totalLoenn: totalSalaries,
          sosialeutgifter: socialCosts,
          pensjonskostnader: pensionCosts,
          totalPersonalkostnader: totalPersonnelCosts
        },
        gjennomsnittsloenPerAnsatt: Math.round(avgSalary),
        omsetningPerAnsatt: Math.round(revenue / employees),
        produktivitet: {
          omsetningPerAnsatt: Math.round(revenue / employees),
          driftsresultatPerAnsatt: Math.round(operatingResult / employees)
        }
      },
      bransjesammenligning: {
        bransje: sector.bransje,
        naceKode: sector.naceKode,
        posisjonOmsetning: rand(QUARTILE_POSITIONS),
        posisjonLoennsomhet: rand(QUARTILE_POSITIONS),
        posisjonSoliditet: rand(QUARTILE_POSITIONS)
      },
      risikovurdering: {
        kredittvurdering: rand(CREDIT_RATINGS.slice(0, 8)), // Favor better ratings
        konkursrisiko: rand(RISK_LEVELS.slice(0, 3)), // Favor lower risk
        betalingsevne: rand(PAYMENT_ABILITY.slice(0, 3)), // Favor better ability
        finansiellStabilitet: rand(FINANCIAL_STABILITY.slice(0, 3)) // Favor better stability
      }
    });
  }
  
  // Calculate trend analysis based on the generated data
  const revenueGrowthRates = regnskapsaar.slice(1).map((year, index) => 
    (year.finansielleNokkeltal.omsetning.beloep - regnskapsaar[index].finansielleNokkeltal.omsetning.beloep) / regnskapsaar[index].finansielleNokkeltal.omsetning.beloep * 100
  );
  const avgRevenueGrowth = revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) / revenueGrowthRates.length;
  
  const employeeGrowthRate = ((regnskapsaar[4].ansatte.antallAnsatte - regnskapsaar[0].ansatte.antallAnsatte) / regnskapsaar[0].ansatte.antallAnsatte * 100);
  
  // Generate future projections
  const latestYear = regnskapsaar[4];
  const projectedRevenue = Math.round(latestYear.finansielleNokkeltal.omsetning.beloep * (1 + avgRevenueGrowth / 100));
  const projectedOperatingResult = Math.round(projectedRevenue * (latestYear.loennsomhetsnoekkeltal.driftsmargin / 100));
  const projectedEmployees = Math.round(latestYear.ansatte.antallAnsatte * (1 + employeeGrowthRate / 100 / 4));
  
  return {
    organisasjonsnummer: orgnr,
    organisasjonsnavn: orgDetails?.name || rand(companyNames),
    regnskapsaar: regnskapsaar,
    trendanalyse: {
      omsetningsvekst: {
        treAarsSnitt: Math.round(avgRevenueGrowth * 10) / 10,
        trend: avgRevenueGrowth > 5 ? 'Positiv' : avgRevenueGrowth > 0 ? 'Stabil' : 'Negativ',
        volatilitet: Math.max(...revenueGrowthRates) - Math.min(...revenueGrowthRates) > 20 ? 'Høy' : 'Lav'
      },
      loennsomhetsutvikling: {
        driftsmarginsutvikling: regnskapsaar[4].loennsomhetsnoekkeltal.driftsmargin > regnskapsaar[0].loennsomhetsnoekkeltal.driftsmargin ? 'Forbedring' : 'Forverring',
        egenkapitalrentabilitetsutvikling: regnskapsaar[4].loennsomhetsnoekkeltal.egenkapitalrentabilitet > regnskapsaar[0].loennsomhetsnoekkeltal.egenkapitalrentabilitet ? 'Stabil vekst' : 'Nedgang',
        trend: rand(TREND_DIRECTIONS.slice(0, 3))
      },
      soliditetsutvikling: {
        egenkapitalandelsutvikling: regnskapsaar[4].finansielleNokkeltal.egenkapital.egenkapitalandel > regnskapsaar[0].finansielleNokkeltal.egenkapital.egenkapitalandel ? 'Forbedring' : 'Forverring',
        gjeldsgradutvikling: regnskapsaar[4].finansielleNokkeltal.gjeld.gjeldsgrad < regnskapsaar[0].finansielleNokkeltal.gjeld.gjeldsgrad ? 'Reduksjon' : 'Økning',
        trend: rand(TREND_DIRECTIONS.slice(0, 3))
      },
      ansatteutvikling: {
        vekstrate: Math.round(employeeGrowthRate * 10) / 10,
        produktivitetsutvikling: rand(['Forbedring', 'Stabil', 'Forverring']),
        loennskostnadskontroll: rand(['Utmerket', 'God', 'Tilfredsstillende'])
      }
    },
    prognoser: {
      aar: currentYear + 1,
      forventetOmsetning: {
        beloep: projectedRevenue,
        vekstrate: Math.round(avgRevenueGrowth * 10) / 10,
        konfidensintervall: {
          nedre: Math.round(projectedRevenue * 0.9),
          ovre: Math.round(projectedRevenue * 1.1)
        }
      },
      forventetDriftsresultat: {
        beloep: projectedOperatingResult,
        margin: Math.round(latestYear.loennsomhetsnoekkeltal.driftsmargin * 10) / 10,
        konfidensintervall: {
          nedre: Math.round(projectedOperatingResult * 0.85),
          ovre: Math.round(projectedOperatingResult * 1.15)
        }
      },
      forventetAntallAnsatte: {
        antall: projectedEmployees,
        vekstrate: Math.round((employeeGrowthRate / 4) * 10) / 10
      }
    }
  };
}