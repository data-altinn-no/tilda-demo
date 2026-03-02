// Core data types for Tilda application

export interface NaceCode {
  code: string;
  name: string;
}

export interface CityCoordinates {
  x: number;
  y: number;
}

export interface TilsynsrapportItem {
  id: string;
  tilsynsmyndighet: string;
  tema: string;
  dato: string;
  sted: string;
  reaksjon: string;
  brudd: boolean;
  alvorlighetsgrad?: number;
}

export interface TilsynskoordineringItem {
  id: string;
  tilsynsmyndighet: string;
  tema: string;
  planlagtDato: string;
  status: string;
}

export interface MeldingItem {
  id: string;
  type: string;
  dato: string;
  avsender: string;
  tittel: string;
  innhold: string;
  lest: boolean;
}

export interface OrganisationDetails {
  name: string;
  orgnr: string;
  address: string;
  city: string;
  postalCode: string;
  naceCode: string;
  naceName: string;
  organizationForm: string;
  employees: number;
  established: string;
}

export interface VehicleData {
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  status: string;
}

export interface PropertyData {
  address: string;
  city: string;
  postalCode: string;
  propertyType: string;
  size: number;
  cadastralNumber: string;
}

export interface RoleData {
  name: string;
  role: string;
  birthYear: number;
  fromDate: string;
  toDate?: string;
}

export interface FinancialData {
  revenue: number;
  profit: number;
  equity: number;
  debt: number;
  employees: number;
  year: number;
  creditRating: string;
  paymentRemarks: number;
}

export interface RelatedCompany {
  orgnr: string;
  name: string;
  relationship: string;
  ownershipPercent?: number;
}

export interface BruddAggregation {
  tema: string;
  brudd: number;
  total: number;
}

export interface AuthorityBruddMap {
  [authority: string]: BruddAggregation[];
}

export interface Repository {
  name: string;
  description: string;
  url: string;
  language: string;
  topics: string[];
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
}

export interface UsefulLink {
  title: string;
  description: string;
  url: string;
  icon: any; // Lucide icon component
}

export interface TabDefinition {
  id: string;
  label: string;
  icon: any; // Lucide icon component
}

export interface AppCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any; // Lucide icon component
  path: string;
  color: string;
  available: boolean;
}

export interface Authority {
  name: string;
  logo: string | null;
  url: string;
}
