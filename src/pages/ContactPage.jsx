import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Mail, 
  ExternalLink,
  MessageSquare,
  Users,
  FileText,
  Github,
  Building2
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Contact information
 */
const CONTACTS = [
  {
    id: "forvaltning",
    title: "Forvaltningsansvarlig",
    organization: "Brønnøysundregistrene",
    description: "For sporsmal om Tilda-tjenesten, tilgang og integrasjon",
    email: "kkn@brreg.no",
    icon: Users,
    color: "blue",
  },
  {
    id: "teknisk",
    title: "Teknisk support",
    organization: "data.altinn.no/Digdir",
    description: "For tekniske sporsmal om API, autentisering og feilsituasjoner",
    email: "dan@altinn.no",
    icon: MessageSquare,
    color: "green",
  },
];

const RESOURCES = [
  {
    title: "GitHub",
    description: "Kildekode og issues",
    url: "https://github.com/data-altinn-no",
    icon: Github,
  },
  {
    title: "Dokumentasjon",
    description: "Offisiell dokumentasjon",
    url: "https://docs.data.altinn.no/tjenester/tilsynsdata/",
    icon: FileText,
  },
  {
    title: "data.altinn.no",
    description: "API-portal og metadata",
    url: "https://data.altinn.no",
    icon: Building2,
  },
];

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
};

/**
 * Contact card component
 */
function ContactCard({ contact }) {
  const Icon = contact.icon;
  const colors = COLOR_MAP[contact.color] || COLOR_MAP.blue;

  return (
    <div className={`digdir-card p-6 ${colors.border} border-2 h-full`}>
      <div className="flex items-start gap-4 h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">{contact.title}</h3>
            <p className="text-sm text-neutral-500 mb-2 font-medium">{contact.organization}</p>
            <p className="text-neutral-600 text-sm mb-4">{contact.description}</p>
          </div>
          <a 
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium w-fit"
          >
            <Mail className="w-4 h-4" />
            {contact.email}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Contact Page
 */
export function ContactPage() {
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
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Kontakt oss</h1>
                <p className="text-neutral-600">Vi hjelper deg gjerne</p>
              </div>
            </div>
            <p className="text-neutral-600 mt-4 max-w-3xl">
              Har du sporsmal om Tilda-tjenesten, trenger hjelp med integrasjon, 
              eller vil gi tilbakemelding? Ta kontakt med oss.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Kontaktpersoner</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {CONTACTS.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </div>

          <div className="digdir-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Tilbakemeldinger</h2>
                <p className="text-neutral-600 mb-3">
                  Vi setter pris pa tilbakemeldinger om dokumentasjonen og disse sidene.
                  Har du forslag til forbedringer eller har du oppdaget feil? Gi oss beskjed! :)
                </p>
                <a 
                  href="https://github.com/data-altinn-no/tilda-demo/issues/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-medium"
                >
                  Opprett en sak pa GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="digdir-card p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Tilda-samarbeidet pa Slack</h2>
                <p className="text-neutral-600 mb-3">
                  Alle som er med i Tilda-samarbeidet har tilgang til en privat kanal på Digdir sin offentlige Slack.
                  Her kan man utveksle erfaringer og spørre andre om hjelp.
                </p>
                <a 
                  href="https://join.slack.com/t/digdir-samarbeid/shared_invite/zt-2yp202pnk-PXnfUDQICM3PFDPXfehGiQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  Bli med pa Slack
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Nyttige ressurser</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {RESOURCES.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a 
                    key={resource.title}
                    href={resource.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all digdir-card"
                  >
                    <Icon className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{resource.title}</div>
                      <div className="text-sm text-neutral-500">{resource.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="digdir-card p-6 bg-neutral-50">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Om Tilda</h2>
            <p className="text-neutral-600 mb-4">
              Tilda er en datadelingstjeneste utviklet av Digitaliseringsdirektoratet i samarbeid 
              med Bronnoysundregistrene. Tjenesten lar tilsynsmyndigheter dele og hente tilsynsdata 
              pa en sikker og standardisert mate.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.digdir.no" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Digitaliseringsdirektoratet
                <ExternalLink className="w-4 h-4" />
              </a>
              <a 
                href="https://www.brreg.no" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Bronnoysundregistrene
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
