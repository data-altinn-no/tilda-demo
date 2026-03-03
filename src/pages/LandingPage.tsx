import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, FileText, Building2, ClipboardList, Database, Mail, AlertTriangle, Code, Plug, BarChart3, TestTube, LucideIcon } from "lucide-react";
import { Footer } from "../components/layout";

interface App {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  available: boolean;
}

interface Authority {
  name: string;
  logo: string | null;
  url: string;
}

/**
 * Landing page with navigation cards to different apps
 */
export function LandingPage() {
  const apps: App[] = [
    {
      id: "tilda",
      title: "Tilsynsdashboard",
      subtitle: "Demo",
      description: "En demonstrasjon av hvordan Tilda-tjenesten kan se ut i hos en tilsynsmyndighet. Alle data er vilkårlig generert.",
      icon: Share2,
      path: "/tilda",
      color: "primary",
      available: true,
    },
    {
      id: "veiledninger",
      title: "Guider og veiledninger",
      subtitle: "Kom i gang",
      description: "Veiledninger for datakonsumenter og dataprodusenter. Lær hvordan du tar i bruk Tilda-tjenesten.",
      icon: FileText,
      path: "/veiledninger",
      color: "primary",
      available: true,
    },
    {
      id: "datamodeller",
      title: "Datamodeller",
      subtitle: "Dokumentasjon",
      description: "Utforsk datamodellene som brukes i Tilda. Se strukturer, felter og relasjoner mellom ulike datatyper.",
      icon: Database,
      path: "/datamodeller",
      color: "primary",
      available: true,
    },
    {
      id: "kontakt",
      title: "Kontakt oss",
      subtitle: "Hjelp og support",
      description: "Har du sporsmal eller tilbakemeldinger? Kontakt forvaltningsansvarlig eller teknisk support.",
      icon: Mail,
      path: "/kontakt",
      color: "primary",
      available: true,
    },
    {
      id: "api",
      title: "API-dokumentasjon",
      subtitle: "For utviklere",
      description: "Teknisk dokumentasjon for Tilda REST API. Se endepunkter, autentisering og kodeeksempler.",
      icon: Plug,
      path: "/api",
      color: "primary",
      available: true,
    },
    {
      id: "kode",
      title: "Kodeeksempler",
      subtitle: "For utviklere",
      description: "GitHub-repositorier, kodeeksempler og lenker til relevante ressurser for Tilda-integrasjon.",
      icon: Code,
      path: "/kode",
      color: "primary",
      available: true,
    },
    {
      id: "statistikk",
      title: "Statistikk",
      subtitle: "Innsikt og bruk",
      description: "Oppdatert statistikk om dataflyt i Tilda-tjenesten.",
      icon: BarChart3,
      path: "/statistikk",
      color: "primary",
      available: true,
    },
    {
      id: "testdata",
      title: "Testdata",
      subtitle: "Syntetiske datasett",
      description: "Tilgang til testdata og syntetiske datasett for utvikling og testing av integrasjoner mot Tilda.",
      icon: TestTube,
      path: "/testdata",
      color: "primary",
      available: true,
    },
  ];

  const authorities: Authority[] = [
    { name: "Justervesenet", logo: "https://altinncdn.no/orgs/brg/brreg.png", url: "https://www.justervesenet.no" },
    { name: "Arbeidstilsynet", logo: "https://altinncdn.no/orgs/dat/arbeidstilsynet.png", url: "https://www.arbeidstilsynet.no" },
    { name: "Mattilsynet", logo: "https://altinncdn.no/orgs/mat/mat_logo.svg", url: "https://www.mattilsynet.no" },
    { name: "Miljødirektoratet", logo: "https://altinncdn.no/orgs/mdir/mdir_logo.svg", url: "https://www.miljodirektoratet.no" },
    { name: "DSB", logo: "https://altinncdn.no/orgs/dsb/dsb.png", url: "https://www.dsb.no" },
    { name: "Fiskeridirektoratet", logo: "https://altinncdn.no/orgs/fd/fiskeridirektoratet.png", url: "https://www.fiskeridir.no" },
    { name: "Sjøfartsdirektoratet", logo: null, url: "https://www.sdir.no" },                  
    { name: "Konkurransetilsynet", logo: "https://altinncdn.no/orgs/kt/kt.jpg", url: "https://www.konkurransetilsynet.no" },
    { name: "Havindustritilsynet", logo: null, url: "https://www.havtil.no" },
    { name: "UU-tilsynet", logo: null, url: "https://www.uutilsynet.no" },
    { name: "Direktoratet for mineralforvaltning", logo: "https://altinncdn.no/orgs/dmf/dmf.png", url: "https://www.dirmin.no" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full animate-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-12"
        >
          {/* Header Section */}
          <div className="text-center pt-8 pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-12 h-12 text-primary-500" />
            </div>
            <h1 className="text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              Tilda@data.altinn.no
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Datadelingstjenesten Tilda <br></br>
              Her finner du alt du trenger for å bli kjent med Tilda og ta den i bruk!
            </p>
          </div>

          {/* Under Development Notice */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3 -mt-6">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-amber-800">Under utvikling</span>
              <span className="text-amber-700 ml-2">
                Denne siden er under aktiv utvikling og er ikke et ferdig produkt. Innhold og funksjonalitet kan endres.
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="digdir-card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Hva er Tilda?
                </h2>
                <p className="text-neutral-600 mb-3">
                  <strong>Tilda</strong> er en nasjonal datadelingstjeneste som lar tilsynsmyndigheter 
                  dele og hente informasjon om sine tilsyn med andre tilsynsmyndigheter. Tjenesten er utviklet på data.altinn.no av Digitaliseringsdirektoratet 
                  og eies av Brønnøysundregistrene.
                </p>
                <p className="text-neutral-600 text-sm">
                  <em>Merk: Data som vises på denne demosiden er <strong>generert</strong> for demonstrasjonsformål.</em>
                </p>
              </div>
            </div>
            
            {/* Participating Authorities */}
            <div className="border-t border-primary-200 pt-4">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Deltakende tilsynsmyndigheter</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {authorities.map((authority) => (
                  <a 
                    key={authority.name || authority.url}
                    href={authority.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg p-3 border border-neutral-200 flex flex-col items-center justify-center min-h-[72px] gap-2 hover:border-primary-300 hover:shadow-sm transition-all"
                    title={authority.name || ""}
                  >
                    {authority.logo && (
                      <img 
                        src={authority.logo} 
                        alt={authority.name || ""} 
                        className="max-h-8 max-w-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    {!authority.logo && (
                      <span className="text-xs text-neutral-600 text-center leading-tight">{authority.name}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* App Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {apps.map((app, index) => {
              const Icon = app.icon;
              const isAvailable = app.available;
              
              const cardContent = (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.2 + index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  className={`digdir-card p-8 h-full flex flex-col transition-all duration-300 ${
                    isAvailable 
                      ? "hover:shadow-lg hover:border-primary-300 cursor-pointer group" 
                      : "opacity-75 cursor-not-allowed"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    isAvailable 
                      ? "bg-primary-100 group-hover:bg-primary-200 transition-colors" 
                      : "bg-neutral-100"
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      isAvailable ? "text-primary-600" : "text-neutral-400"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-2xl font-bold ${
                        isAvailable ? "text-neutral-900" : "text-neutral-500"
                      }`}>
                        {app.title}
                      </h3>
                      {!isAvailable && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-600 rounded-full">
                          Kommer snart
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium mb-3 ${
                      isAvailable ? "text-primary-600" : "text-neutral-400"
                    }`}>
                      {app.subtitle}
                    </p>
                    <p className="text-neutral-600 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                </motion.div>
              );

              return isAvailable ? (
                <Link key={app.id} to={app.path} className="block h-full">
                  {cardContent}
                </Link>
              ) : (
                <div key={app.id} className="block h-full">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
