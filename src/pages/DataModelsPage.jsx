import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Database, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Building2,
  Car,
  Home,
  Users,
  Mail,
  TrendingUp,
  ClipboardList,
  Calendar
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Data model definitions for Tilda
 */
const DATA_MODELS = [
  {
    id: "tilsynsrapport",
    name: "Tilsynsrapport",
    description: "Rapport fra gjennomført tilsyn med funn og reaksjoner",
    icon: ClipboardList,
    color: "blue",
    fields: [
      { name: "tilsynsmyndighet", type: "string", description: "Navn på tilsynsmyndighet som utførte tilsynet" },
      { name: "organisasjonsnummer", type: "string", description: "9-sifret organisasjonsnummer" },
      { name: "dato", type: "date", description: "Dato for tilsynet (ISO 8601)" },
      { name: "funn_alvorlighetsgrad", type: "enum", description: "Alvorlighetsgrad: Ingen, Lav, Medium, Høy" },
      { name: "reaksjonstype", type: "string", description: "Type reaksjon fra tilsynsmyndigheten" },
      { name: "tema", type: "string", description: "Tilsynstema (f.eks. HMS, Arbeidsmiljø)" },
      { name: "tilsynsadresse", type: "string", description: "Adresse hvor tilsynet ble utført" },
      { name: "varpisel", type: "enum", description: "Varslet eller Uanmeldt tilsyn" },
      { name: "kontaktperson", type: "object", description: "Kontaktperson med navn og kontaktinfo" },
      { name: "status", type: "enum", description: "Gjennomført eller Under oppfølging" },
      { name: "rapportUrl", type: "string", description: "URL til fullstendig rapport (PDF)" },
    ]
  },
  {
    id: "tilsynskoordinering",
    name: "Tilsynskoordinering",
    description: "Planlagte og koordinerte tilsyn mellom myndigheter",
    icon: Calendar,
    color: "purple",
    fields: [
      { name: "tilsynsmyndighet", type: "string", description: "Ansvarlig tilsynsmyndighet" },
      { name: "organisasjonsnummer", type: "string", description: "Organisasjon som skal ha tilsyn" },
      { name: "tilsynstema", type: "string", description: "Tema for det planlagte tilsynet" },
      { name: "startdato", type: "date", description: "Planlagt startdato" },
      { name: "sluttdato", type: "date?", description: "Planlagt sluttdato (valgfri)" },
      { name: "kontrolladresse", type: "string", description: "Adresse for tilsynet" },
      { name: "tilsynsaktivitet", type: "enum", description: "Tilsyn eller Kampanje" },
      { name: "varighet_timer", type: "number", description: "Estimert varighet i timer" },
    ]
  },
  {
    id: "melding",
    name: "Melding",
    description: "Meldinger mellom tilsynsmyndigheter om en virksomhet",
    icon: Mail,
    color: "green",
    fields: [
      { name: "identifikator", type: "string", description: "Unik meldings-ID (MSG-orgnr-nr)" },
      { name: "mottaker", type: "string", description: "Mottakende tilsynsmyndighet" },
      { name: "meldingOmTildaenhet", type: "string", description: "Organisasjonsnummer meldingen gjelder" },
      { name: "datoForMeldingTilAnnenMyndighet", type: "datetime", description: "Tidspunkt for sending" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "object", description: "Innhold med meldingsType og fritekst" },
    ]
  },
  {
    id: "organisasjon",
    name: "Organisasjon",
    description: "Grunnleggende informasjon om en virksomhet",
    icon: Building2,
    color: "orange",
    fields: [
      { name: "name", type: "string", description: "Virksomhetens navn" },
      { name: "address", type: "string", description: "Gateadresse" },
      { name: "zipcode", type: "string", description: "Postnummer" },
      { name: "city", type: "string", description: "Poststed" },
      { name: "naceCode", type: "string", description: "NACE-kode for bransje" },
      { name: "naceCodeName", type: "string", description: "Beskrivelse av NACE-kode" },
      { name: "organisationForm", type: "string", description: "Organisasjonsform (AS, ENK, etc.)" },
      { name: "organisasjonsnummer", type: "string", description: "9-sifret organisasjonsnummer" },
    ]
  },
  {
    id: "kjoretoy",
    name: "Kjøretøy",
    description: "Kjøretøydata registrert på virksomheten",
    icon: Car,
    color: "red",
    fields: [
      { name: "id", type: "string", description: "Unik kjøretøy-ID" },
      { name: "eier", type: "boolean", description: "Om virksomheten eier kjøretøyet" },
      { name: "leaser", type: "boolean", description: "Om kjøretøyet er leaset" },
      { name: "kjennemerke", type: "string", description: "Registreringsnummer" },
      { name: "understellsnummer", type: "string", description: "VIN-nummer (17 tegn)" },
      { name: "forstegangsregistrert", type: "date", description: "Dato for førstegangsregistrering" },
      { name: "kjoretoygruppe", type: "enum", description: "Personbil, Varebil, Lastebil, etc." },
      { name: "kjoretoymerke", type: "string", description: "Bilmerke" },
      { name: "miljoklasse", type: "string?", description: "Euro-klasse (null for elbil)" },
      { name: "drivstoff", type: "enum?", description: "Bensin, Diesel, Elektrisk, etc." },
      { name: "co2utslipp", type: "number", description: "CO2-utslipp i g/km" },
      { name: "nesteEUKontroll", type: "date", description: "Dato for neste EU-kontroll" },
    ]
  },
  {
    id: "eiendom",
    name: "Eiendom",
    description: "Eiendomsinformasjon fra grunnboken",
    icon: Home,
    color: "teal",
    fields: [
      { name: "grunnboksinformasjon", type: "object", description: "Kommune, gårds-/bruksnr, areal" },
      { name: "grunnboksinformasjon.kommune", type: "string", description: "Kommune hvor eiendommen ligger" },
      { name: "grunnboksinformasjon.gaardsnummer", type: "string", description: "Gårdsnummer" },
      { name: "grunnboksinformasjon.bruksnummer", type: "string", description: "Bruksnummer" },
      { name: "grunnboksinformasjon.bygningsareal", type: "number", description: "Bygningsareal i m²" },
      { name: "rettighetshavereTilEiendomsrett", type: "object", description: "Eierinfo med dato og vederlag" },
      { name: "pantedokumenter", type: "array", description: "Liste over pantedokumenter" },
      { name: "harKulturminne", type: "boolean", description: "Om eiendommen har kulturminne" },
    ]
  },
  {
    id: "rolle",
    name: "Rolle",
    description: "Roller og verv i virksomheten",
    icon: Users,
    color: "indigo",
    fields: [
      { name: "navn", type: "string", description: "Navn på person eller selskap" },
      { name: "rolle", type: "enum", description: "Daglig leder, Styreleder, Styremedlem, etc." },
      { name: "fodselsdato", type: "date", description: "Fødselsdato" },
      { name: "aktiv", type: "boolean", description: "Om rollen er aktiv" },
      { name: "fraOgMed", type: "date", description: "Startdato for rollen" },
      { name: "tilOgMed", type: "date?", description: "Sluttdato (null hvis aktiv)" },
      { name: "adresse", type: "string", description: "Adresse" },
      { name: "poststed", type: "string", description: "Postnummer og sted" },
      { name: "ansvarsomrader", type: "array", description: "Liste over ansvarsområder" },
    ]
  },
  {
    id: "okonomi",
    name: "Økonomisk informasjon",
    description: "Regnskapsdata og finansielle nøkkeltall",
    icon: TrendingUp,
    color: "emerald",
    fields: [
      { name: "regnskapsaar", type: "array", description: "Liste over regnskapsår med data" },
      { name: "regnskapsaar[].aar", type: "number", description: "Regnskapsår" },
      { name: "regnskapsaar[].finansielleNokkeltal", type: "object", description: "Finansielle nøkkeltall" },
      { name: "finansielleNokkeltal.omsetning", type: "object", description: "Omsetning med beløp og endring" },
      { name: "finansielleNokkeltal.driftsresultat", type: "object", description: "Driftsresultat med margin" },
      { name: "finansielleNokkeltal.egenkapital", type: "object", description: "Egenkapital og -andel" },
      { name: "finansielleNokkeltal.gjeld", type: "object", description: "Kort- og langsiktig gjeld" },
      { name: "loennsomhetsnoekkeltal", type: "object", description: "Marginer og rentabilitet" },
      { name: "likviditetsnoekkeltal", type: "object", description: "Likviditetsgrader og kontantstrøm" },
      { name: "ansatte", type: "object", description: "Antall ansatte og lønnskostnader" },
    ]
  },
];

/**
 * Color mapping for model cards
 */
const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "bg-red-100 text-red-700" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", icon: "text-teal-600", badge: "bg-teal-100 text-teal-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
};

/**
 * Type badge component
 */
function TypeBadge({ type }) {
  const baseClasses = "px-2 py-0.5 rounded text-xs font-mono";
  
  if (type.includes("string")) return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>{type}</span>;
  if (type.includes("number")) return <span className={`${baseClasses} bg-green-100 text-green-700`}>{type}</span>;
  if (type.includes("boolean")) return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>{type}</span>;
  if (type.includes("date")) return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>{type}</span>;
  if (type.includes("enum")) return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>{type}</span>;
  if (type.includes("object")) return <span className={`${baseClasses} bg-pink-100 text-pink-700`}>{type}</span>;
  if (type.includes("array")) return <span className={`${baseClasses} bg-indigo-100 text-indigo-700`}>{type}</span>;
  
  return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{type}</span>;
}

/**
 * Expandable model card component
 */
function ModelCard({ model, isExpanded, onToggle }) {
  const Icon = model.icon;
  const colors = COLOR_MAP[model.color] || COLOR_MAP.blue;
  
  return (
    <motion.div
      layout
      className={`digdir-card overflow-hidden transition-all duration-300 ${colors.border} border-2`}
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
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-neutral-200"
        >
          <div className="p-5 bg-white">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Felt</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3">Beskrivelse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {model.fields.map((field, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="py-2.5 pr-4">
                      <code className="font-mono text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {field.name}
                      </code>
                    </td>
                    <td className="py-2.5 pr-4">
                      <TypeBadge type={field.type} />
                    </td>
                    <td className="py-2.5 text-neutral-600">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Data Models Page
 */
export function DataModelsPage() {
  const [expandedModels, setExpandedModels] = useState(new Set(["tilsynsrapport"]));
  
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
