import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, FileText, Building2, ClipboardList, Database, Mail, AlertTriangle } from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Landing page with navigation cards to different apps
 */
export function LandingPage() {
  const apps = [
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
      icon: Database,
      path: "/api",
      color: "primary",
      available: true,
    },
    {
      id: "symmetri",
      title: "Symmetrikort",
      subtitle: "Ta kontakt",
      description: "Har du spørsmål eller tilbakemeldinger? Ta kontakt med oss for mer informasjon om Tilda og datadeling.",
      icon: Mail,
      path: "/api",
      color: "neutral",
      available: false,
    },
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
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Om denne siden
                </h2>
                <p className="text-neutral-600">
                  Denne siden skal illustrere og forklare verdien og virkemåten til Tilda-tjenesten.
                  Data som vises er <strong>generert</strong> for demonstrasjonsformål.
                </p>
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
