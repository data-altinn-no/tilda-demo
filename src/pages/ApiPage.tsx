import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Code, 
  Key, 
  Server, 
  FileJson, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Footer } from "../components/layout";

interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  description: string;
  path: string;
  parameters: ApiParameter[];
  response: string;
}

interface Environment {
  name: string;
  baseUrl: string;
  description: string;
}

interface EndpointCardProps {
  endpoint: ApiEndpoint;
  isExpanded: boolean;
  onToggle: () => void;
}

interface CodeExampleProps {
  code: string;
}

/**
 * API endpoint definitions
 */
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "tilsynsrapport",
    name: "TildaTilsynsrapportv1",
    method: "GET",
    description: "Hent tilsynsrapporter for en organisasjon",
    path: "/v1/evidence/{accreditationId}",
    parameters: [
      { name: "startdato", type: "dateTime", required: false, description: "Filtrer fra dato" },
      { name: "sluttdato", type: "dateTime", required: false, description: "Filtrer til dato" },
      { name: "tilsynskilder", type: "string", required: false, description: "Kommaseparert liste med orgnr for tilsynsmyndigheter" },
      { name: "inkluderUnderenheter", type: "boolean", required: false, description: "Inkluder underenheter i soket" },
    ],
    response: "AuditReportList",
  },
  {
    id: "tilsynskoordinering",
    name: "TildaTilsynskoordineringv1",
    method: "GET",
    description: "Hent tilsynskoordineringer for en organisasjon",
    path: "/v1/evidence/{accreditationId}",
    parameters: [
      { name: "startdato", type: "dateTime", required: false, description: "Filtrer fra dato" },
      { name: "sluttdato", type: "dateTime", required: false, description: "Filtrer til dato" },
      { name: "tilsynskilder", type: "string", required: false, description: "Kommaseparert liste med orgnr for tilsynsmyndigheter" },
      { name: "inkluderUnderenheter", type: "boolean", required: false, description: "Inkluder underenheter i soket" },
    ],
    response: "AuditCoordinationList",
  },
  {
    id: "npdid",
    name: "TildaNPDIDv1",
    method: "GET",
    description: "Hent NPDID-rapporter for petroleumsvirksomhet",
    path: "/v1/evidence/{accreditationId}",
    parameters: [
      { name: "startdato", type: "dateTime", required: false, description: "Filtrer fra dato" },
      { name: "sluttdato", type: "dateTime", required: false, description: "Filtrer til dato" },
      { name: "tilsynskilder", type: "string", required: false, description: "Kommaseparert liste med orgnr" },
      { name: "npdid", type: "string", required: false, description: "Filtrer pa NPDID" },
      { name: "inkluderUnderenheter", type: "boolean", required: false, description: "Inkluder underenheter" },
    ],
    response: "NPDIDAuditReportList",
  },
  {
    id: "mtam",
    name: "TildaMeldingTilAnnenMyndighetv1",
    method: "GET",
    description: "Hent meldinger til annen myndighet",
    path: "/mtam",
    parameters: [
      { name: "fromDate", type: "dateTime", required: true, description: "Hent meldinger fra dette tidspunktet" },
    ],
    response: "AlertMessage[]",
  },
  {
    id: "metadata",
    name: "TildaMetadatav1",
    method: "GET",
    description: "Hent metadata om tilgjengelige datakilder",
    path: "/v1/public/metadata/evidencecodes/tilda",
    parameters: [],
    response: "EvidenceCode[]",
  },
];

/**
 * Environment configurations
 */
const ENVIRONMENTS: Record<string, Environment> = {
  test: {
    name: "Test",
    baseUrl: "https://test.api.data.altinn.no",
    description: "Testmiljø for utvikling og testing"
  },
  prod: {
    name: "Produksjon",
    baseUrl: "https://api.data.altinn.no",
    description: "Produksjonsmiljø"
  }
};

/**
 * Code example snippets - function to generate based on environment
 */
const getCodeExamples = (baseUrl: string): Record<string, string> => ({
  curl: `curl -X GET "${baseUrl}/v1/evidence/{accreditationId}" \\
  -H "Authorization: Bearer {access_token}" \\
  -H "Ocp-Apim-Subscription-Key: {subscription_key}"`,
  
  csharp: `using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);
client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", subscriptionKey);

var response = await client.GetAsync(
    "${baseUrl}/v1/evidence/{accreditationId}");
var content = await response.Content.ReadAsStringAsync();`,

  javascript: `const response = await fetch(
  "${baseUrl}/v1/evidence/{accreditationId}",
  {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  }
);
const data = await response.json();`,
});

/**
 * Expandable endpoint card
 */
function EndpointCard({ endpoint, isExpanded, onToggle }: EndpointCardProps) {
  const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="digdir-card overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors ${isExpanded ? 'bg-neutral-50' : ''}`}
      >
        <span className={`px-3 py-1 rounded-md text-sm font-mono font-semibold border ${methodColors[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{endpoint.name}</h3>
          <p className="text-sm text-neutral-600 truncate">{endpoint.description}</p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Endepunkt</h4>
            <code className="block bg-neutral-100 px-4 py-2 rounded-lg text-sm font-mono text-neutral-800">
              {endpoint.path}
            </code>
          </div>

          {endpoint.parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Parametere</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Navn</th>
                      <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Type</th>
                      <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Pakrevd</th>
                      <th className="text-left py-2 font-semibold text-neutral-600">Beskrivelse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param) => (
                      <tr key={param.name} className="border-b border-neutral-100">
                        <td className="py-2 pr-4 font-mono text-primary-600">{param.name}</td>
                        <td className="py-2 pr-4">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-mono">
                            {param.type}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {param.required ? (
                            <span className="text-red-600 font-medium">Ja</span>
                          ) : (
                            <span className="text-neutral-400">Nei</span>
                          )}
                        </td>
                        <td className="py-2 text-neutral-600">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Respons</h4>
            <Link 
              to="/datamodeller" 
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-mono text-sm"
            >
              {endpoint.response}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Code example with copy button
 */
function CodeExample({ code }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors"
        title="Kopier kode"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-neutral-300" />
        )}
      </button>
      <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * API Documentation Page
 */
export function ApiPage() {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [activeCodeTab, setActiveCodeTab] = useState<string>("curl");
  const [environment, setEnvironment] = useState<string>("prod");

  const currentEnv = ENVIRONMENTS[environment];
  const CODE_EXAMPLES = getCodeExamples(currentEnv.baseUrl);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints(prev => {
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
    setExpandedEndpoints(new Set(API_ENDPOINTS.map(e => e.id)));
  };

  const collapseAll = () => {
    setExpandedEndpoints(new Set());
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
                <Code className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">API-dokumentasjon</h1>
                <p className="text-neutral-600">Tilda REST API via data.altinn.no</p>
              </div>
            </div>
            <p className="text-neutral-600 mt-4 max-w-3xl">
              Tilda-data er tilgjengelig via data.altinn.no sitt REST API. 
              For a fa tilgang ma du ha en Maskinporten-integrasjon med scopet <code className="bg-neutral-100 px-2 py-0.5 rounded text-sm">altinn:dataaltinnno/tilda</code>.
            </p>
          </div>

          <div className="digdir-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Autentisering</h2>
                <p className="text-neutral-600 mb-3">
                  API-et krever autentisering via Maskinporten. Du trenger:
                </p>
                <ul className="list-disc list-inside text-neutral-600 space-y-1">
                  <li>Maskinporten-token med scope <code className="bg-white/50 px-1.5 py-0.5 rounded text-sm">altinn:dataaltinnno/tilda</code></li>
                  <li>API-nokkel (Subscription Key) fra data.altinn.no</li>
                </ul>
                <a 
                  href="https://docs.data.altinn.no/bruke-rest-api/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-amber-700 hover:text-amber-800 font-medium"
                >
                  Les mer om autentisering
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Environment Selector */}
          <div className="digdir-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-neutral-900">Miljø og Base URL</h2>
                  <div className="flex bg-neutral-100 rounded-lg p-1">
                    {Object.entries(ENVIRONMENTS).map(([key, env]) => (
                      <button
                        key={key}
                        onClick={() => setEnvironment(key)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          environment === key
                            ? "bg-white text-primary-700 shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {env.name}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mb-2">{currentEnv.description}</p>
                <code className="block bg-neutral-100 px-4 py-3 rounded-lg text-sm font-mono text-neutral-800">
                  {currentEnv.baseUrl}
                </code>
              </div>
            </div>
          </div>

          <div className="digdir-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileJson className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Kodeeksempler</h2>
                <p className="text-neutral-600 text-sm">Eksempler pa hvordan du kan kalle API-et</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[
                { id: "curl", label: "cURL" },
                { id: "javascript", label: "JavaScript" },
                { id: "csharp", label: "C#" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCodeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <CodeExample code={CODE_EXAMPLES[activeCodeTab]} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Endepunkter</h2>
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
              {API_ENDPOINTS.map((endpoint) => (
                <EndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  isExpanded={expandedEndpoints.has(endpoint.id)}
                  onToggle={() => toggleEndpoint(endpoint.id)}
                />
              ))}
            </div>
          </div>

          <div className="digdir-card p-6 bg-neutral-50">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Nyttige lenker</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="https://data.altinn.no/api-details" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <Server className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">API Portal</div>
                  <div className="text-sm text-neutral-500">Test API-ene interaktivt</div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 ml-auto" />
              </a>
              <a 
                href="https://docs.data.altinn.no/tjenester/tilsynsdata/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <FileJson className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Dokumentasjon</div>
                  <div className="text-sm text-neutral-500">Fullstendig API-dokumentasjon</div>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 ml-auto" />
              </a>
              <Link 
                to="/datamodeller"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <FileJson className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Datamodeller</div>
                  <div className="text-sm text-neutral-500">Se JSON-skjemaer og typer</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </Link>
              <a 
                href="https://samarbeid.digdir.no/maskinporten/maskinporten/25" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <Key className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Maskinporten</div>
                  <div className="text-sm text-neutral-500">Sett opp autentisering</div>
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
