import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Database, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Mail,
  ClipboardList,
  Calendar
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Data model definitions for Tilda
 * Based on JSON schemas from https://api.data.altinn.no/v1/public/metadata/evidencecodes/tilda
 */
const DATA_MODELS = [
  {
    id: "tilsynsrapport",
    name: "tilsynsrapport (AuditReport)",
    description: "Rapport fra gjennomført tilsyn med funn og reaksjoner",
    icon: ClipboardList,
    color: "blue",
    fields: [
      { name: "tildaenhet", type: "string?", description: "Organisasjonsnummer for tilsynsobjektet" },
      { name: "tilsynutfoertav", type: "string?", description: "Tilsynsmyndighet som utførte tilsynet" },
      { name: "ansvarligTilsynsmyndighet", type: "string?", description: "Ansvarlig tilsynsmyndighet" },
      { name: "tilsynsegenskaper", type: "ControlAttribute?", description: "Egenskaper ved tilsynet" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "Adresser hvor tilsynet ble utført" },
      { name: "utfoerteTilsynsaktiviteter", type: "ControlActivity[]?", description: "Liste over utførte tilsynsaktiviteter" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "Kontaktpersoner for tilsynet" },
      { name: "tilsynsnotater", type: "string?", description: "Notater fra tilsynet" },
      { name: "anmerkninger", type: "Remark[]?", description: "Anmerkninger og merknader" },
      { name: "bruddOgReaksjoner", type: "Reaction[]?", description: "Brudd og reaksjoner fra tilsynet" },
    ]
  },
  {
    id: "tilsynskoordinering",
    name: "tilsynskoordinering (AuditCoordination)",
    description: "Planlagte og koordinerte tilsyn mellom myndigheter",
    icon: Calendar,
    color: "purple",
    fields: [
      { name: "tildaenhet", type: "string?", description: "Organisasjonsnummer for tilsynsobjektet" },
      { name: "tilsynutfoertav", type: "string?", description: "Tilsynsmyndighet som utfører tilsynet" },
      { name: "ansvarligtilsynsmyndighet", type: "string?", description: "Ansvarlig tilsynsmyndighet" },
      { name: "tilsynsstatus", type: "ControlState", description: "Status for tilsynet" },
      { name: "uanmeldttilsyn", type: "SurpriseControlAttributeType", description: "Om tilsynet er uanmeldt" },
      { name: "storulykketilsyn", type: "MajorAccidentAttributeType", description: "Om det er storulykketilsyn" },
      { name: "internTilsynsid", type: "string?", description: "Intern ID for tilsynet" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "Adresser for tilsynet" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "Kontaktpersoner" },
      { name: "meldingTilAnnenMyndighet", type: "AlertFull[]?", description: "Meldinger til andre myndigheter" },
      { name: "aapnetilsyn", type: "integer", description: "Antall åpne tilsyn" },
      { name: "planlagteKontroller", type: "PlannedControlActivity[]?", description: "Planlagte kontrollaktiviteter" },
      { name: "tilsynskampanjer", type: "Campaign[]?", description: "Tilsynskampanjer" },
    ]
  },
  {
    id: "melding",
    name: "meldingTilAnnenMyndighet (AlertMessage)",
    description: "Meldinger mellom tilsynsmyndigheter om en virksomhet",
    icon: Mail,
    color: "green",
    fields: [
      { name: "identifikator", type: "string", description: "Unik meldings-ID (UUID)" },
      { name: "datoForMeldingTilAnnenMyndighet", type: "datetime", description: "Tidspunkt for sending" },
      { name: "mottaker", type: "string", description: "Organisasjonsnummer til mottakende tilsynsmyndighet" },
      { name: "meldingOmTildaenhet", type: "string", description: "Organisasjonsnummer meldingen gjelder" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "MeldingsInnhold", description: "Innhold med meldingsType og fritekst" },
    ]
  },
  {
    id: "npdid",
    name: "npdid (NPDIDAuditReport)",
    description: "Tilsynsrapporter med NPDID-referanse for petroleumsvirksomhet",
    icon: FileText,
    color: "orange",
    fields: [
      { name: "npdid", type: "string?", description: "NPDID-referanse" },
      { name: "tildaenhet", type: "string?", description: "Organisasjonsnummer for tilsynsobjektet" },
      { name: "tilsynutfoertav", type: "string?", description: "Tilsynsmyndighet som utførte tilsynet" },
      { name: "ansvarligtilsynsmyndighet", type: "string?", description: "Ansvarlig tilsynsmyndighet" },
      { name: "tilsynsegenskaper", type: "ControlAttribute?", description: "Egenskaper ved tilsynet" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "Adresser hvor tilsynet ble utført" },
      { name: "utfoerteTilsynsaktiviteter", type: "ControlActivity[]?", description: "Liste over utførte tilsynsaktiviteter" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "Kontaktpersoner for tilsynet" },
      { name: "tilsynsnotater", type: "string?", description: "Notater fra tilsynet" },
      { name: "anmerkninger", type: "Remark[]?", description: "Anmerkninger og merknader" },
      { name: "bruddOgReaksjoner", type: "Reaction[]?", description: "Brudd og reaksjoner fra tilsynet" },
    ]
  },
  {
    id: "storulykkevirksomhet",
    name: "storulykkevirksomhet (StorulykkevirksomhetKontroll)",
    description: "Informasjon om storulykkevirksomheter",
    icon: FileText,
    color: "red",
    fields: [
      { name: "bedriftsnummer", type: "string?", description: "Bedriftsnummer" },
      { name: "paragraf6", type: "boolean", description: "Omfattet av §6 i storulykkeforskriften" },
      { name: "paragraf9", type: "boolean", description: "Omfattet av §9 i storulykkeforskriften" },
    ]
  },
];

/**
 * Complex type definitions - nested types that can be expanded
 * Based on JSON schemas from https://api.data.altinn.no/v1/public/metadata/evidencecodes/tilda
 */
const COMPLEX_TYPES = {
  ControlAttribute: {
    name: "ControlAttribute",
    description: "Egenskaper ved tilsynet",
    fields: [
      { name: "internTilsynsid", type: "string?", description: "Intern ID for tilsynet" },
      { name: "storulykketilsyn", type: "MajorAccidentAttributeType", description: "Om det er storulykketilsyn" },
      { name: "uanmeldttilsyn", type: "SurpriseControlAttributeType", description: "Om tilsynet er uanmeldt" },
      { name: "tilsynsutvelgelse", type: "string?", description: "Hvordan tilsynet ble valgt ut" },
      { name: "tilsynsstatus", type: "ControlState", description: "Status for tilsynet" },
      { name: "tilsynstema", type: "string?", description: "Tema for tilsynet" },
      { name: "tilsynsnoekkelord", type: "string?", description: "Nøkkelord for tilsynet" },
      { name: "nettrapport", type: "string?", description: "URL til nettrapport" },
    ]
  },
  AuditAddress: {
    name: "AuditAddress",
    description: "Adresseinformasjon for tilsynslokasjon",
    fields: [
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "lokalitetsbeskrivelse", type: "string?", description: "Beskrivelse av lokaliteten" },
      { name: "lokalitetsnoekkelord", type: "string?", description: "Nøkkelord for lokaliteten" },
      { name: "lengdegrad", type: "string?", description: "Geografisk lengdegrad" },
      { name: "breddegrad", type: "string?", description: "Geografisk breddegrad" },
      { name: "bygningsnummer", type: "string?", description: "Bygningsnummer" },
      { name: "bruksenhetsnummer", type: "string?", description: "Bruksenhetsnummer" },
      { name: "adressenavn", type: "string?", description: "Navn på adresse/gate" },
      { name: "adressenummer", type: "string?", description: "Gatenummer" },
      { name: "postnummer", type: "string?", description: "Postnummer" },
      { name: "poststedsnavn", type: "string?", description: "Navn på poststed" },
      { name: "kommunenummer", type: "string?", description: "Kommunenummer" },
      { name: "bydel", type: "string?", description: "Bydel" },
      { name: "fylkesnummer", type: "string?", description: "Fylkesnummer" },
    ]
  },
  ControlActivity: {
    name: "ControlActivity",
    description: "Utført tilsynsaktivitet",
    fields: [
      { name: "tilsynsaktivitetreferanse", type: "integer", description: "Referanse til aktiviteten" },
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "internAktivitetsidentifikator", type: "string?", description: "Intern ID for aktiviteten" },
      { name: "kontrollobjekt", type: "string?", description: "Kontrollobjekt" },
      { name: "startdatoForTilsynsaktivitet", type: "datetime", description: "Startdato for aktiviteten" },
      { name: "varighetForTilsynsaktivitet", type: "integer", description: "Varighet i minutter" },
      { name: "tilsynsaktivitet", type: "string?", description: "Type tilsynsaktivitet" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan aktiviteten ble utført" },
      { name: "observasjonFraTilsynsaktivitet", type: "string?", description: "Observasjoner fra aktiviteten" },
      { name: "samtidigeKontroller", type: "CoordinatedControlAgency[]?", description: "Samtidige kontroller med andre myndigheter" },
      { name: "meldingTilAnnenMyndighet", type: "AlertCompact[]?", description: "Meldinger til andre myndigheter" },
    ]
  },
  ControlContact: {
    name: "ControlContact",
    description: "Kontaktinformasjon for tilsyn",
    fields: [
      { name: "kontaktperson", type: "string?", description: "Navn på kontaktperson" },
      { name: "avdeling", type: "string?", description: "Avdeling" },
      { name: "telefonnummer", type: "string?", description: "Telefonnummer" },
      { name: "epost", type: "string?", description: "E-postadresse" },
      { name: "adresse", type: "string?", description: "Postadresse" },
    ]
  },
  Remark: {
    name: "Remark",
    description: "Anmerkning fra tilsyn",
    fields: [
      { name: "anmerkningsreferanse", type: "integer", description: "Referanse til anmerkning" },
      { name: "anmerkning", type: "string?", description: "Anmerkningstekst" },
    ]
  },
  Reaction: {
    name: "Reaction",
    description: "Brudd og reaksjon fra tilsyn",
    fields: [
      { name: "bruddOgReaksjonsreferanse", type: "integer", description: "Referanse til brudd/reaksjon" },
      { name: "tilsynsaktivitetreferanse", type: "integer", description: "Referanse til tilsynsaktivitet" },
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "utredningAvBruddOgReaksjon", type: "string?", description: "Utredning av bruddet" },
      { name: "lovparagraf", type: "string?", description: "Relevant lovparagraf" },
      { name: "reaksjonsdato", type: "datetime", description: "Dato for reaksjon" },
      { name: "alvorsgrad", type: "ControlReactionDetails?", description: "Alvorlighetsgrad" },
      { name: "antallGangerVirkemiddelErTattIBruk", type: "integer", description: "Antall ganger virkemiddel er brukt" },
    ]
  },
  ControlReactionDetails: {
    name: "ControlReactionDetails",
    description: "Detaljer om reaksjonsgrad",
    fields: [
      { name: "utmaaltReaksjonsverdi", type: "integer", description: "Utmålt reaksjonsverdi" },
      { name: "utmaaltReaksjonstype", type: "string?", description: "Type reaksjon" },
      { name: "utmaaltReaksjonsklasse", type: "integer", description: "Reaksjonsklasse" },
      { name: "lavreaksjonsverdi", type: "integer", description: "Lav reaksjonsverdi" },
      { name: "hoeyreaksjonsverdi", type: "integer", description: "Høy reaksjonsverdi" },
      { name: "lavalvorsgradindeks", type: "integer", description: "Lav alvorsgradindeks" },
      { name: "hoeyalvorsgradindeks", type: "integer", description: "Høy alvorsgradindeks" },
    ]
  },
  AlertFull: {
    name: "AlertFull",
    description: "Fullstendig melding til annen myndighet",
    fields: [
      { name: "meldingTilMyndighet", type: "string?", description: "Mottakende myndighet" },
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "string?", description: "Innhold i meldingen" },
      { name: "datoForMeldingTilAnnenMyndighet", type: "datetime", description: "Dato for melding" },
    ]
  },
  AlertCompact: {
    name: "AlertCompact",
    description: "Kompakt melding til annen myndighet",
    fields: [
      { name: "meldingTilmyndighet", type: "string?", description: "Mottakende myndighet" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "string?", description: "Innhold i meldingen" },
    ]
  },
  PlannedControlActivity: {
    name: "PlannedControlActivity",
    description: "Planlagt kontrollaktivitet",
    fields: [
      { name: "planlagtkontrolldato", type: "datetime", description: "Planlagt kontrolldato" },
      { name: "planlagtkontrollVarighet", type: "integer", description: "Planlagt varighet i minutter" },
      { name: "tilsynstema", type: "string?", description: "Tema for tilsynet" },
      { name: "tilsynsaktivitet", type: "string?", description: "Type aktivitet" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan aktiviteten skal utføres" },
      { name: "samtidigeKontroller", type: "CoordinatedControlAgency[]?", description: "Samtidige kontroller" },
    ]
  },
  CoordinatedControlAgency: {
    name: "CoordinatedControlAgency",
    description: "Samtidig tilsynsmyndighet",
    fields: [
      { name: "samtidigTilsynsmyndighet", type: "string?", description: "Organisasjonsnummer til samtidig tilsynsmyndighet" },
      { name: "tilsynstema", type: "string?", description: "Tema for tilsynet" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan aktiviteten utføres" },
    ]
  },
  Campaign: {
    name: "Campaign",
    description: "Tilsynskampanje",
    fields: [
      { name: "kampanjenavn", type: "string?", description: "Navn på kampanjen" },
      { name: "kampanjebeskrivelse", type: "string?", description: "Beskrivelse av kampanjen" },
      { name: "startdatoForKampanje", type: "datetime", description: "Startdato for kampanjen" },
      { name: "sluttdatoForKampanje", type: "datetime", description: "Sluttdato for kampanjen" },
    ]
  },
  MeldingsInnhold: {
    name: "MeldingsInnhold",
    description: "Innhold i melding til annen myndighet",
    fields: [
      { name: "meldingsType", type: "string", description: "Type melding (varsel-om-rapport, varsel-om-koordinering, varsel-fritekst)" },
      { name: "fritekst", type: "string?", description: "Fritekst i meldingen" },
    ]
  },
  ControlState: {
    name: "ControlState (enum)",
    description: "Status for tilsyn",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "aapen", type: "enum", description: "Tilsynet er åpent" },
      { name: "lukket", type: "enum", description: "Tilsynet er lukket" },
      { name: "avbrutt", type: "enum", description: "Tilsynet er avbrutt" },
      { name: "planlegging", type: "enum", description: "Tilsynet er under planlegging" },
    ]
  },
  SurpriseControlAttributeType: {
    name: "SurpriseControlAttributeType (enum)",
    description: "Om tilsynet er uanmeldt",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "ja", type: "enum", description: "Uanmeldt tilsyn" },
      { name: "nei", type: "enum", description: "Varslet tilsyn" },
    ]
  },
  MajorAccidentAttributeType: {
    name: "MajorAccidentAttributeType (enum)",
    description: "Om det er storulykketilsyn",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "nei", type: "enum", description: "Ikke storulykketilsyn" },
      { name: "meldepliktig", type: "enum", description: "Meldepliktig virksomhet" },
      { name: "rapporteringspliktig", type: "enum", description: "Rapporteringspliktig virksomhet" },
      { name: "ja", type: "enum", description: "Er storulykketilsyn" },
    ]
  },
};

/**
 * Helper to extract base type name from type string (e.g., "AuditAddress[]?" -> "AuditAddress")
 */
function getBaseTypeName(type) {
  return type.replace(/[\[\]\?]/g, '');
}

/**
 * Check if a type is a complex type that can be expanded
 */
function isComplexType(type) {
  const baseType = getBaseTypeName(type);
  return COMPLEX_TYPES.hasOwnProperty(baseType);
}

/**
 * Color mapping for model cards
 */
const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "bg-red-100 text-red-700" },
};

/**
 * Type badge component
 */
function TypeBadge({ type, isClickable = false }) {
  const baseClasses = "px-2 py-0.5 rounded text-xs font-mono";
  const clickableClasses = isClickable ? "cursor-pointer hover:ring-2 hover:ring-offset-1" : "";
  
  if (type.includes("string")) return <span className={`${baseClasses} ${clickableClasses} bg-blue-100 text-blue-700 ${isClickable ? 'hover:ring-blue-300' : ''}`}>{type}</span>;
  if (type.includes("number")) return <span className={`${baseClasses} ${clickableClasses} bg-green-100 text-green-700 ${isClickable ? 'hover:ring-green-300' : ''}`}>{type}</span>;
  if (type.includes("boolean")) return <span className={`${baseClasses} ${clickableClasses} bg-purple-100 text-purple-700 ${isClickable ? 'hover:ring-purple-300' : ''}`}>{type}</span>;
  if (type.includes("date")) return <span className={`${baseClasses} ${clickableClasses} bg-orange-100 text-orange-700 ${isClickable ? 'hover:ring-orange-300' : ''}`}>{type}</span>;
  if (type.includes("enum")) return <span className={`${baseClasses} ${clickableClasses} bg-yellow-100 text-yellow-700 ${isClickable ? 'hover:ring-yellow-300' : ''}`}>{type}</span>;
  if (type.includes("object")) return <span className={`${baseClasses} ${clickableClasses} bg-pink-100 text-pink-700 ${isClickable ? 'hover:ring-pink-300' : ''}`}>{type}</span>;
  if (type.includes("array")) return <span className={`${baseClasses} ${clickableClasses} bg-indigo-100 text-indigo-700 ${isClickable ? 'hover:ring-indigo-300' : ''}`}>{type}</span>;
  
  // Complex types get a special style
  if (isClickable) {
    return <span className={`${baseClasses} ${clickableClasses} bg-violet-100 text-violet-700 hover:ring-violet-300`}>{type}</span>;
  }
  
  return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{type}</span>;
}

/**
 * Expandable field row component for complex types
 */
function FieldRow({ field, depth = 0, expandedFields, toggleField }) {
  const fieldKey = `${depth}-${field.name}`;
  const isExpanded = expandedFields.has(fieldKey);
  const hasComplexType = isComplexType(field.type);
  const baseTypeName = getBaseTypeName(field.type);
  const complexType = hasComplexType ? COMPLEX_TYPES[baseTypeName] : null;
  
  const indentClass = depth > 0 ? `pl-${Math.min(depth * 4, 12)}` : '';
  
  return (
    <>
      <tr 
        className={`text-sm ${hasComplexType ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
        onClick={hasComplexType ? () => toggleField(fieldKey) : undefined}
      >
        <td className={`py-2.5 pr-4 ${indentClass}`}>
          <div className="flex items-center gap-2">
            {hasComplexType && (
              <span className="text-neutral-400 w-4 flex-shrink-0">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
            {!hasComplexType && depth > 0 && <span className="w-4 flex-shrink-0" />}
            <code className="font-mono text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
              {field.name}
            </code>
          </div>
        </td>
        <td className="py-2.5 pr-4">
          <TypeBadge type={field.type} isClickable={hasComplexType} />
        </td>
        <td className="py-2.5 text-neutral-600">
          <div className="flex items-center gap-2">
            {field.description}
            {hasComplexType && (
              <span className="text-xs text-violet-600 font-medium">
                (klikk for å utvide)
              </span>
            )}
          </div>
        </td>
      </tr>
      
      {/* Nested fields for complex types */}
      {isExpanded && complexType && (
        <>
          <tr className="bg-violet-50/50">
            <td colSpan={3} className={`py-1.5 px-4 ${depth > 0 ? 'pl-8' : 'pl-4'}`}>
              <div className="text-xs text-violet-700 font-medium flex items-center gap-2">
                <span className="bg-violet-200 px-1.5 py-0.5 rounded">{complexType.name}</span>
                <span className="text-violet-600">{complexType.description}</span>
              </div>
            </td>
          </tr>
          {complexType.fields.map((nestedField, idx) => (
            <FieldRow
              key={`${fieldKey}-${idx}`}
              field={nestedField}
              depth={depth + 1}
              expandedFields={expandedFields}
              toggleField={toggleField}
            />
          ))}
        </>
      )}
    </>
  );
}

/**
 * Expandable model card component
 */
function ModelCard({ model, isExpanded, onToggle }) {
  const Icon = model.icon;
  const colors = COLOR_MAP[model.color] || COLOR_MAP.blue;
  const [expandedFields, setExpandedFields] = useState(new Set());
  
  const toggleField = (fieldKey) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  };
  
  return (
    <div
      className={`digdir-card overflow-hidden ${colors.border} border-2`}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors ${isExpanded ? colors.bg : ''}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{model.name}</h3>
          <p className="text-sm text-neutral-600 truncate">{model.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            {model.fields.length} felt
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-neutral-200">
          <div className="p-5 bg-white">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4 w-1/4">Felt</th>
                  <th className="pb-3 pr-4 w-1/4">Type</th>
                  <th className="pb-3">Beskrivelse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {model.fields.map((field, idx) => (
                  <FieldRow
                    key={idx}
                    field={field}
                    depth={0}
                    expandedFields={expandedFields}
                    toggleField={toggleField}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Data Models Page
 */
export function DataModelsPage() {
  const [expandedModels, setExpandedModels] = useState(new Set());
  
  const toggleModel = (modelId) => {
    setExpandedModels(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };
  
  const expandAll = () => {
    setExpandedModels(new Set(DATA_MODELS.map(m => m.id)));
  };
  
  const collapseAll = () => {
    setExpandedModels(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full animate-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8"
        >
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>

          {/* Header */}
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Datamodeller</h1>
                <p className="text-neutral-600">Dokumentasjon av datastrukturer i Tilda</p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="digdir-card p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-neutral-700">
                  Denne siden viser datamodellene som brukes i Tilda-demonstrasjonen. 
                  Klikk på en modell for å se alle feltene og deres beskrivelser.
                  Dataene er generert for demonstrasjonsformål og representerer typiske strukturer 
                  for deling av tilsynsdata mellom offentlige myndigheter.
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {DATA_MODELS.length} datamodeller
            </p>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Vis alle
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Skjul alle
              </button>
            </div>
          </div>

          {/* Model cards */}
          <div className="grid gap-4">
            {DATA_MODELS.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isExpanded={expandedModels.has(model.id)}
                onToggle={() => toggleModel(model.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
