import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  TestTube, 
  Download, 
  Copy,
  ExternalLink,
  FileText,
  Database,
  Code,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Settings,
  Globe,
  Lock
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Test environments and datasets
 */
const TEST_ENVIRONMENTS = [
  {
    id: "staging",
    name: "Test-miljø", 
    description: "Pre-produksjonsmiljø for sluttesting",
    url: "https://test-api.data.altinn.no",
    status: "active",
    dataSize: "~x tilsynsmyndigheter er tilgjengelig",
    lastUpdated: "2024-01-20"
  }
];

const SYNTHETIC_DATASETS = [
  {
    id: "tilsynsrapporter",
    name: "Tilsynsrapporter",
    description: "Komplette tilsynsrapporter med alle felter utfylt",
    format: "JSON",
    size: "1.2 MB",
    records: 150,
    categories: ["Arbeidsmiljø", "Mattrygghet", "Miljøvern", "Sikkerhet"],
    downloadUrl: "/api/testdata/tilsynsrapporter.json"
  },
  {
    id: "koordinering",
    name: "Tilsynskoordinering",
    description: "Planlagte tilsyn og koordinering mellom myndigheter",
    format: "JSON",
    size: "800 KB",
    records: 89,
    categories: ["Planlagte tilsyn", "Samtidige kontroller", "Kampanjer"],
    downloadUrl: "/api/testdata/koordinering.json"
  },
  {
    id: "meldinger",
    name: "Meldinger til andre myndigheter",
    description: "Eksempler på meldinger sendt mellom tilsynsmyndigheter",
    format: "JSON",
    size: "245 KB",
    records: 67,
    categories: ["Varsler", "Koordinering", "Fritekst"],
    downloadUrl: "/api/testdata/meldinger.json"
  },
  {
    id: "npdid",
    name: "NPDID-rapporter",
    description: "Tilsynsrapporter med NPDID-referanser for petroleumsvirksomhet",
    format: "JSON",
    size: "650 KB",
    records: 45,
    categories: ["Petroleumstilsyn", "Sikkerhet", "Miljø"],
    downloadUrl: "/api/testdata/npdid.json"
  },
  {
    id: "storulykke",
    name: "Storulykkevirksomheter",
    description: "Informasjon om virksomheter omfattet av storulykkeforskriften",
    format: "JSON",
    size: "120 KB",
    records: 23,
    categories: ["§6-virksomheter", "§9-virksomheter"],
    downloadUrl: "/api/testdata/storulykke.json"
  }
];

const CODE_EXAMPLES = [
  {
    id: "fetch-testdata",
    title: "Hente testdata",
    language: "javascript",
    code: `// Eksempel på å hente testdata fra test-miljøet
const testApiUrl = "https://test.data.altinn.no/v1";
const accessToken = await getMaskinportenToken("test");

// Hent tilsynsrapporter for testing
const response = await fetch(\`\${testApiUrl}/directharvest/TildaTilsynsrapportv1\`, {
  headers: {
    "Authorization": \`Bearer \${accessToken}\`,
    "Ocp-Apim-Subscription-Key": testSubscriptionKey
  }
});

const testData = await response.json();
console.log("Testdata hentet:", testData);`
  },
  {
    id: "validate-integration",
    title: "Validere integrasjon",
    language: "csharp",
    code: `// Eksempel på å validere integrasjon mot testdata
public async Task<bool> ValidateIntegrationAsync()
{
    var testClient = new TildaTestClient(testEnvironmentConfig);
    
    // Test 1: Hent tilsynsrapporter
    var reports = await testClient.GetAuditReportsAsync("123456789");
    Assert.IsTrue(reports.Count > 0, "Skal returnere testdata");
    
    // Test 2: Valider datastruktur
    var firstReport = reports.First();
    Assert.IsNotNull(firstReport.TildaEnhet, "TildaEnhet skal være utfylt");
    Assert.IsNotNull(firstReport.TilsynUtfoertAv, "TilsynUtfoertAv skal være utfylt");
    
    // Test 3: Test koordinering
    var coordinations = await testClient.GetCoordinationsAsync("123456789");
    Assert.IsTrue(coordinations.Any(), "Skal returnere koordineringsdata");
    
    return true;
}`
  }
];

/**
 * Dataset card component
 */
function DatasetCard({ dataset }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(dataset.downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="digdir-card p-6 border-2 border-neutral-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{dataset.name}</h3>
            <p className="text-sm text-neutral-600">{dataset.format} • {dataset.size} • {dataset.records} poster</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Kopier URL"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-neutral-600 mb-4">{dataset.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {dataset.categories.map((category) => (
          <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {category}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono text-neutral-700">
          {dataset.downloadUrl}
        </code>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Last ned
        </button>
      </div>
    </div>
  );
}

/**
 * Environment card component
 */
function EnvironmentCard({ environment }) {
  const statusColors = {
    active: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    maintenance: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" }
  };
  
  const status = statusColors[environment.status] || statusColors.inactive;
  
  return (
    <div className="digdir-card p-6 border-2 border-neutral-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{environment.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                {environment.status === 'active' ? 'Aktiv' : environment.status === 'maintenance' ? 'Vedlikehold' : 'Inaktiv'}
              </span>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4" />
          Åpne
        </button>
      </div>
      
      <p className="text-neutral-600 mb-4">{environment.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">URL:</span>
          <code className="text-neutral-900 font-mono">{environment.url}</code>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Datastørrelse:</span>
          <span className="text-neutral-900">{environment.dataSize}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Sist oppdatert:</span>
          <span className="text-neutral-900">{environment.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Test data page
 */
export function TestDataPage() {
  const [activeTab, setActiveTab] = useState("datasets");
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full animate-in">
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
                <TestTube className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Testdata</h1>
                <p className="text-neutral-600">Syntetiske datasett og testmiljøer for Tilda</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="digdir-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Om testdata</h3>
                <p className="text-neutral-600 mb-3">
                  Testdata i Tilda skal være basert på Tenor og inneholder ikke reelle tilsynsdata. 
                  Testdataene består av et sett med Tenor-virksomheter som alle i Tilda-samarbeidet skal støtte og er laget for å teste integrasjoner og utvikle applikasjoner som bruker Tilda-tjenesten.
                </p>
                <p className="text-neutral-600 text-sm">
                  <strong>Viktig:</strong> Testdata oppdateres jevnlig og skal ikke brukes i produksjonsmiljøer.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("datasets")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "datasets"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Datasett
              </button>
              <button
                onClick={() => setActiveTab("environments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "environments"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Testmiljøer
              </button>
              <button
                onClick={() => setActiveTab("examples")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "examples"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Kodeeksempler
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "datasets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Syntetiske datasett</h2>
                <p className="text-sm text-neutral-600">{SYNTHETIC_DATASETS.length} datasett tilgjengelig</p>
              </div>
              
              <div className="grid gap-6">
                {SYNTHETIC_DATASETS.map((dataset) => (
                  <DatasetCard key={dataset.id} dataset={dataset} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "environments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Testmiljøer</h2>
                <p className="text-sm text-neutral-600">{TEST_ENVIRONMENTS.length} miljøer tilgjengelig</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {TEST_ENVIRONMENTS.map((environment) => (
                  <EnvironmentCard key={environment.id} environment={environment} />
                ))}
              </div>

              {/* Access Info */}
              <div className="digdir-card p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tilgang til testmiljøer</h3>
                    <p className="text-neutral-600 mb-3">
                      For å få tilgang til testmiljøene trenger du Maskinporten-tilgang med scopet 
                      <code className="bg-orange-100 px-1 py-0.5 rounded text-orange-800 font-mono text-sm mx-1">
                        altinn:dataaltinnno/tilda
                      </code>
                    </p>
                    <p className="text-neutral-600 text-sm">
                      Kontakt <a href="mailto:dan@altinn.no" className="text-orange-700 hover:text-orange-800 font-medium">dan@altinn.no</a> for å få tilgang.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "examples" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Kodeeksempler</h2>
                <p className="text-sm text-neutral-600">Eksempler på bruk av testdata</p>
              </div>
              
              <div className="space-y-6">
                {CODE_EXAMPLES.map((example) => (
                  <div key={example.id} className="digdir-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">{example.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-mono rounded">
                          {example.language}
                        </span>
                        <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                ))}
              </div>

              {/* Testing Guidelines */}
              <div className="digdir-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Testanbefalinger</h3>
                    <ul className="text-neutral-600 space-y-2 text-sm">
                      <li>• Test alle datamodeller mot syntetiske datasett før produksjon</li>
                      <li>• Valider at integrasjonen håndterer tomme og null-verdier korrekt</li>
                      <li>• Test feilhåndtering med ugyldig organisasjonsnummer (999999999)</li>
                      <li>• Verifiser at autentisering fungerer mot testmiljøet</li>
                      <li>• Test paginering og store datasett</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
