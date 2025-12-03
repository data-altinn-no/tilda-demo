// Supervision authorities
export const AUTHORITIES = [
  "Miljødirektoratet", 
  "Arbeidstilsynet", 
  "Mattilsynet", 
  "DSB", 
  "Fiskeridirektoratet", 
  "Konkurransetilsynet", 
  "UU-tilsynet", 
  "Justervesenet",
  "NSO", 
  "Helsetilsynet",
  "Eltilsyn", 
  "Branntilsyn", 
  "Statsforvalteren i Agder", 
  "Statsforvalteren i Vestland"
];

// Supervision themes
export const THEMES = [
  "Utslipp", 
  "HMS", 
  "Kjemikalier", 
  "Brannvern", 
  "Hygiene", 
  "Avfall", 
  "Støy", 
  "Vannkvalitet", 
  "Stillassikring"
];

// Reaction types
export const REACTIONS = [
  "Pålegg", 
  "Stans", 
  "Gebyr", 
  "Veiledning", 
  "Ingen", 
  "Smekk på fingrene"
];

// Norwegian cities
export const CITIES = [
  "Oslo", 
  "Bergen", 
  "Stavanger", 
  "Trondheim", 
  "Kristiansand", 
  "Tromsø",
  "Drammen", 
  "Fredrikstad", 
  "Sandnes", 
  "Haugesund", 
  "Molde", 
  "Ålesund",
  "Bodø", 
  "Narvik", 
  "Harstad", 
  "Tønsberg", 
  "Moss", 
  "Skien"
];

// Street names
export const STREET_NAMES = [
  "Storgata", 
  "Hovedveien", 
  "Industriveien", 
  "Havnegata", 
  "Fjellveien", 
  "Skogveien",
  "Parkveien", 
  "Sentrumsveien", 
  "Bryggegata", 
  "Torggata", 
  "Kongens gate", 
  "Dronningens gate",
  "Østre gate", 
  "Vestre gate", 
  "Nordre gate", 
  "Søndre gate", 
  "Kirkegata", 
  "Rådhusgata"
];

// Company names
export const COMPANY_NAMES = [
  "Norsk Industri AS", 
  "Bergen Maritime Group", 
  "Stavanger Teknologi", 
  "Trondheim Solutions AS",
  "Oslo Consulting Group", 
  "Kristiansand Shipping", 
  "Tromsø Arctic Services", 
  "Drammen Logistics AS",
  "Fredrikstad Marine", 
  "Sandnes Industrial", 
  "Haugesund Energy AS", 
  "Molde Transport Group",
  "Ålesund Seafood AS", 
  "Bodø Construction", 
  "Narvik Mining Solutions", 
  "Harstad Tech AS"
];

// NACE codes
export const NACE_CODES = [
  { code: "10.110", name: "Bearbeiding og konservering av kjøtt" },
  { code: "20.140", name: "Produksjon av andre organiske kjemikalier" },
  { code: "25.110", name: "Produksjon av bygningselementer av metall" },
  { code: "35.110", name: "Produksjon av elektrisk kraft" },
  { code: "41.200", name: "Oppføring av bygninger" },
  { code: "46.900", name: "Uspesifisert engroshandel" },
  { code: "49.410", name: "Godstransport på vei" },
  { code: "52.240", name: "Lasting og lossing" },
  { code: "62.010", name: "Programmering" },
  { code: "70.220", name: "Bedriftsrådgivning og annen administrativ rådgivning" }
];

// Organization forms
export const ORGANIZATION_FORMS = [
  "Aksjeselskap", 
  "Allmennaksjeselskap", 
  "Enkeltpersonforetak", 
  "Ansvarlig selskap",
  "Kommandittselskap", 
  "Samvirkeforetak", 
  "Stiftelse", 
  "Forening"
];

// Message types
export const MESSAGE_TYPES = [
  "varsel-om-rapport", 
  "forespørsel-om-informasjon", 
  "koordinering-av-tilsyn", 
  "oppfølging-av-funn"
];

// City coordinates for Norway map
export const CITY_COORDINATES = {
  'Oslo': { x: 175, y: 325 },
  'Bergen': { x: 95, y: 285 },
  'Stavanger': { x: 85, y: 345 },
  'Trondheim': { x: 175, y: 205 },
  'Kristiansand': { x: 135, y: 365 },
  'Tromsø': { x: 225, y: 85 },
  'Drammen': { x: 165, y: 335 },
  'Fredrikstad': { x: 185, y: 345 },
  'Sandnes': { x: 80, y: 350 },
  'Haugesund': { x: 90, y: 325 },
  'Molde': { x: 135, y: 245 },
  'Ålesund': { x: 115, y: 255 },
  'Bodø': { x: 195, y: 125 },
  'Narvik': { x: 205, y: 105 },
  'Harstad': { x: 210, y: 95 },
  'Tønsberg': { x: 165, y: 345 },
  'Moss': { x: 180, y: 340 },
  'Skien': { x: 155, y: 345 }
};