import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Users,
  Server,
  FileText,
  Settings,
  Shield
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Guide sections
 */
const GUIDES = [
  {
    id: "kom-i-gang",
    title: "Å ta i bruk Tilda - steg for steg",
    description: "En introduksjon til Tilda og hvordan du kan ta tjenesten i bruk",
    icon: BookOpen,
    color: "blue",
    steps: [
      {
        title: "Forstå hva Tilda er",
        content: "Tilda er en datadelingstjeneste som lar tilsynsmyndigheter dele og hente planlagte tilsyn, tilsynsrapporter og å sende meldinger til andre tilsynsmyndigheter. Alle norske tilsynsmyndigheter er velkommen til å bli med for å utveksle data og dra nytte av erfaringer og samarbeid i Tilda-fellesskapet. Målet er selvsagt at samtlige skal bli med - og at alle både konsumerer og deler data og støtter mottak av meldinger fra de andre."
      },
      {
        title: "Hvordan skape verdi med Tilda?",
        content: "Hvilke tilsynsmyndigheter samarbeider dere med? Hvilke data trenger dere fra andre? Hvilke data kan dere dele med andre?"
      },
      {
        title: "",
        content: "Alle integrasjoner krever Maskinporten-autentisering. Kontakt Digdir for å få tilgang til scopet altinn:dataaltinnno/tilda."
      },
      {
        title: "Test i testmiljo",
        content: "Bruk testmiljoet for a verifisere integrasjonen for du gar i produksjon. Testmiljoet har syntetiske data."
      }
    ]
  },
  {
    id: "datakonsument",
    title: "Guide for datakonsumenter",
    description: "Hvordan hente tilsynsdata fra andre myndigheter",
    icon: Users,
    color: "green",
    steps: [
      {
        title: "Opprett akkreditering",
        content: "For a hente data ma du forst opprette en akkreditering. Dette gjores via POST til /api/v1/accreditations med informasjon om hvilke datasett du vil ha tilgang til."
      },
      {
        title: "Hent data",
        content: "Bruk akkrediterings-ID-en til a hente data via GET /api/v1/evidence/{accreditationId}. Du kan filtrere pa dato, tilsynsmyndighet og andre parametere."
      },
      {
        title: "Handter responsen",
        content: "Responsen inneholder tilsynsrapporter, koordineringer eller andre datasett avhengig av hva du har bedt om. Se datamodellene for detaljer om strukturen."
      }
    ]
  },
  {
    id: "dataprodusent",
    title: "Guide for dataprodusenter",
    description: "Hvordan dele tilsynsdata med andre myndigheter",
    icon: Server,
    color: "purple",
    steps: [
      {
        title: "Implementer API-endepunkter",
        content: "Som dataprodusent ma du implementere standardiserte API-endepunkter som data.altinn.no kan kalle. Se API-dokumentasjonen for spesifikasjoner."
      },
      {
        title: "Folg datamodellene",
        content: "Alle data ma folge de definerte JSON-skjemaene. Se datamodell-dokumentasjonen for detaljer om tilsynsrapport, koordinering og andre typer."
      },
      {
        title: "Registrer deg som kilde",
        content: "Kontakt forvaltningsansvarlig for a bli registrert som datakilde i Tilda. Du vil fa tildelt et organisasjonsnummer som identifiserer deg som tilsynsmyndighet."
      },
      {
        title: "Test integrasjonen",
        content: "Verifiser at API-et ditt returnerer korrekt formaterte data ved a teste mot testmiljoet."
      }
    ]
  },
  {
    id: "meldinger",
    title: "Meldinger til annen myndighet",
    description: "Hvordan sende og motta meldinger mellom tilsynsmyndigheter",
    icon: FileText,
    color: "orange",
    steps: [
      {
        title: "Forsta meldingstyper",
        content: "Det finnes tre meldingstyper: varsel-om-rapport (ny tilsynsrapport tilgjengelig), varsel-om-koordinering (planlagt tilsyn), og varsel-fritekst (generell melding)."
      },
      {
        title: "Sende meldinger",
        content: "Meldinger sendes via POST til /mtam-endepunktet. Inkluder mottaker (orgnr), meldingstype og eventuell fritekst."
      },
      {
        title: "Motta meldinger",
        content: "Implementer et GET-endepunkt som returnerer meldinger fra et gitt tidspunkt. data.altinn.no vil polle dette endepunktet regelmessig."
      },
      {
        title: "Kvitter ut meldinger",
        content: "Nar en melding er levert, returner 200 OK for a bekrefte mottak. Meldinger som ikke kvitteres ut vil bli forsokt levert pa nytt."
      }
    ]
  },
  {
    id: "sikkerhet",
    title: "Sikkerhet og tilgangsstyring",
    description: "Autentisering, autorisasjon og personvern",
    icon: Shield,
    color: "red",
    steps: [
      {
        title: "Maskinporten-autentisering",
        content: "Alle API-kall krever et gyldig Maskinporten-token med scopet altinn:dataaltinnno/tilda. Tokenet ma fornyes for det utloper."
      },
      {
        title: "Tilgangskontroll",
        content: "Tilgang til data styres av akkrediteringer. En akkreditering definerer hvilke datasett og organisasjoner du har tilgang til."
      },
      {
        title: "Personvern",
        content: "Tilsynsdata kan inneholde personopplysninger. Sorge for at du har hjemmel for a behandle dataene og at de handteres i henhold til GDPR."
      },
      {
        title: "Logging og sporing",
        content: "Alle API-kall logges. Du kan se hvem som har hentet data om din organisasjon via sporingsloggen."
      }
    ]
  }
];

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100" },
  red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "bg-red-100" },
};

/**
 * Expandable guide card
 */
function GuideCard({ guide, isExpanded, onToggle }) {
  const Icon = guide.icon;
  const colors = COLOR_MAP[guide.color] || COLOR_MAP.blue;

  return (
    <div className={`digdir-card overflow-hidden ${colors.border} border-2`}>
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors ${isExpanded ? colors.bg : ''}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{guide.title}</h3>
          <p className="text-sm text-neutral-600 truncate">{guide.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge} ${colors.icon}`}>
            {guide.steps.length} steg
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 p-5">
          <div className="space-y-4">
            {guide.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} ${colors.icon} font-semibold text-sm`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900 mb-1">{step.title}</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Guides and Documentation Page
 */
export function GuidesPage() {
  const [expandedGuides, setExpandedGuides] = useState(new Set(["kom-i-gang"]));

  const toggleGuide = (id) => {
    setExpandedGuides(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGuides(new Set(GUIDES.map(g => g.id)));
  };

  const collapseAll = () => {
    setExpandedGuides(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full animate-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>

          <div className="border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Guider og veiledninger</h1>
                <p className="text-neutral-600">Kom i gang med Tilda</p>
              </div>
            </div>
            <p className="text-neutral-600 mt-4 max-w-3xl">
              Her finner du veiledninger for hvordan du kan ta i bruk Tilda, enten du er datakonsument 
              som vil hente tilsynsdata, eller dataprodusent som vil dele data med andre myndigheter.
            </p>
          </div>

          <div className="digdir-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Trenger du hjelp?</h2>
                <p className="text-neutral-600 mb-3">
                  Hvis du har sporsmal eller trenger assistanse med integrasjonen, kan du kontakte oss.
                </p>
                <a 
                  href="mailto:dan@altinn.no" 
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  Kontakt forvaltningsansvarlig
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Veiledninger</h2>
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

            <div className="space-y-3">
              {GUIDES.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isExpanded={expandedGuides.has(guide.id)}
                  onToggle={() => toggleGuide(guide.id)}
                />
              ))}
            </div>
          </div>

          <div className="digdir-card p-6 bg-neutral-50">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Relaterte ressurser</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                to="/api"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <Settings className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">API-dokumentasjon</div>
                  <div className="text-sm text-neutral-500">Teknisk API-referanse</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </Link>
              <Link 
                to="/datamodeller"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Datamodeller</div>
                  <div className="text-sm text-neutral-500">JSON-skjemaer og typer</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </Link>
              <a 
                href="https://docs.data.altinn.no/tjenester/tilsynsdata/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <BookOpen className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Offisiell dokumentasjon</div>
                  <div className="text-sm text-neutral-500">docs.data.altinn.no</div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 ml-auto" />
              </a>
              <a 
                href="https://samarbeid.digdir.no/maskinporten/maskinporten/25" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <Shield className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Maskinporten</div>
                  <div className="text-sm text-neutral-500">Autentisering og tilgang</div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 ml-auto" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
