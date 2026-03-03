import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Code, 
  ExternalLink,
  Github,
  FileText,
  Copy,
  Check,
  Terminal,
  BookOpen,
  Package,
  LucideIcon
} from "lucide-react";
import { Footer } from "../components/layout";

interface Repository {
  name: string;
  description: string;
  url: string;
  language: string;
  topics: string[];
}

interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
}

interface UsefulLink {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
}

interface CodeBlockProps {
  code: string;
  language: string;
}

interface RepoCardProps {
  repo: Repository;
}

/**
 * Code repositories
 */
const REPOSITORIES: Repository[] = [
  {
    name: "plugin-tilda",
    description: "Tilda-plugin for data.altinn.no - koden til Tilda-tjenesten i data.altinn.no",
    url: "https://github.com/data-altinn-no/plugin-tilda",
    language: "C#",
    topics: ["tilda", "altinn", "tilsyn"],
  },
  {
    name: "core",
    description: "Eksempelimplementasjon for datatilbyders api i Tilda",
    url: "https://github.com/data-altinn-no/tilda-reference-api",
    language: "C#",
    topics: ["datatilbyder", "api", "tilsynsmyndighet"],
  },
  {
    name: "docs",
    description: "Dokumentasjon for data.altinn.no",
    url: "https://github.com/data-altinn-no/docs",
    language: "Markdown",
    topics: ["documentation", "hugo"],
  },
];

/**
 * Code examples
 */
const CODE_EXAMPLES: CodeExample[] = [
  {
    id: "auth",
    title: "Autentisering med Maskinporten",
    description: "Hent access token fra Maskinporten for API-tilgang",
    language: "csharp",
    code: `// Installer NuGet-pakke: Altinn.ApiClients.Maskinporten
using Altinn.ApiClients.Maskinporten;

var settings = new MaskinportenSettings
{
    ClientId = "din-client-id",
    Scope = "altinn:dataaltinnno/tilda",
    Environment = MaskinportenEnvironment.Production,
    CertificatePkcs12Path = "path/to/certificate.p12"
};

var client = new MaskinportenClient(settings);
var token = await client.GetAccessToken();`,
  },
  {
    id: "fetch-data",
    title: "Hente tilsynsdata",
    description: "Eksempel pa hvordan du henter tilsynsrapporter fra API-et",
    language: "csharp",
    code: `using var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);
httpClient.DefaultRequestHeaders.Add(
    "Ocp-Apim-Subscription-Key", subscriptionKey);

// Opprett akkreditering
var accreditationRequest = new
{
    evidenceRequests = new[]
    {
        new { evidenceCodeName = "TildaTilsynsrapportv1" }
    },
    subject = new { norwegianOrganizationNumber = "123456789" }
};

var response = await httpClient.PostAsJsonAsync(
    "https://api.data.altinn.no/v1/accreditations",
    accreditationRequest);

var accreditation = await response.Content
    .ReadFromJsonAsync<AccreditationResponse>();

// Hent data
var dataResponse = await httpClient.GetAsync(
    $"https://api.data.altinn.no/v1/evidence/{accreditation.Id}");
var tilsynsdata = await dataResponse.Content
    .ReadFromJsonAsync<AuditReportList>();`,
  },
  {
    id: "javascript",
    title: "JavaScript/Node.js eksempel",
    description: "Hente data med JavaScript",
    language: "javascript",
    code: `// Forutsetter at du har hentet Maskinporten-token
const accessToken = await getMaskinportenToken();

// Opprett akkreditering
const accreditationResponse = await fetch(
  "https://api.data.altinn.no/v1/accreditations",
  {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${accessToken}\`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      evidenceRequests: [
        { evidenceCodeName: "TildaTilsynsrapportv1" }
      ],
      subject: { norwegianOrganizationNumber: "123456789" }
    })
  }
);

const accreditation = await accreditationResponse.json();

// Hent tilsynsdata
const dataResponse = await fetch(
  \`https://api.data.altinn.no/v1/evidence/\${accreditation.id}\`,
  {
    headers: {
      "Authorization": \`Bearer \${accessToken}\`,
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  }
);

const tilsynsdata = await dataResponse.json();
console.log(tilsynsdata);`,
  },
  {
    id: "kotlin",
    title: "Kotlin/Java eksempel",
    description: "Hente data med Kotlin (fungerer ogsa i Java)",
    language: "kotlin",
    code: `import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import com.google.gson.Gson

// Forutsetter at du har hentet Maskinporten-token
val accessToken = getMaskinportenToken()
val subscriptionKey = "din-subscription-key"

val client = HttpClient.newHttpClient()
val gson = Gson()

// Opprett akkreditering
val accreditationBody = mapOf(
    "evidenceRequests" to listOf(
        mapOf("evidenceCodeName" to "TildaTilsynsrapportv1")
    ),
    "subject" to mapOf("norwegianOrganizationNumber" to "123456789")
)

val accreditationRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.data.altinn.no/v1/accreditations"))
    .header("Authorization", "Bearer $accessToken")
    .header("Ocp-Apim-Subscription-Key", subscriptionKey)
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(accreditationBody)))
    .build()

val accreditationResponse = client.send(
    accreditationRequest, 
    HttpResponse.BodyHandlers.ofString()
)
val accreditation = gson.fromJson(
    accreditationResponse.body(), 
    Map::class.java
)

// Hent tilsynsdata
val dataRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.data.altinn.no/v1/evidence/\${accreditation["id"]}"))
    .header("Authorization", "Bearer $accessToken")
    .header("Ocp-Apim-Subscription-Key", subscriptionKey)
    .GET()
    .build()

val dataResponse = client.send(dataRequest, HttpResponse.BodyHandlers.ofString())
val tilsynsdata = gson.fromJson(dataResponse.body(), Map::class.java)
println(tilsynsdata)`,
  },
];

/**
 * Useful links
 */
const USEFUL_LINKS: UsefulLink[] = [
  {
    title: "API-dokumentasjon",
    description: "Fullstendig REST API-referanse",
    url: "https://docs.data.altinn.no/bruke-rest-api/",
    icon: FileText,
  },
  {
    title: "Maskinporten-guide",
    description: "Sett opp autentisering",
    url: "https://docs.digdir.no/docs/Maskinporten/maskinporten_guide_apikonsument",
    icon: BookOpen,
  },
  {
    title: "NuGet-pakker",
    description: "Altinn API-klienter for .NET",
    url: "https://www.nuget.org/packages?q=Altinn.ApiClients",
    icon: Package,
  },
  {
    title: "Swagger/OpenAPI",
    description: "Interaktiv API-testing",
    url: "https://data.altinn.no/api-details",
    icon: Terminal,
  },
];

/**
 * Code block with syntax highlighting and copy button
 */
function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="text-xs text-neutral-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors"
          title="Kopier kode"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-neutral-300" />
          )}
        </button>
      </div>
      <pre className="bg-neutral-900 text-neutral-100 p-4 pt-12 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Repository card
 */
function RepoCard({ repo }: RepoCardProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="digdir-card p-5 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <Github className="w-6 h-6 text-neutral-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900">{repo.name}</h3>
            <span className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-mono text-neutral-600">
              {repo.language}
            </span>
          </div>
          <p className="text-sm text-neutral-600 mb-2">{repo.description}</p>
          <div className="flex flex-wrap gap-1">
            {repo.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
      </div>
    </a>
  );
}

/**
 * Code Examples Page
 */
export function CodePage() {
  const [activeExample, setActiveExample] = useState("auth");

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
                <h1 className="text-3xl font-bold text-neutral-900">Kodeeksempler</h1>
                <p className="text-neutral-600">Kom i gang med Tilda-integrasjon</p>
              </div>
            </div>
            <p className="text-neutral-600 mt-4 max-w-3xl">
              Her finner du kodeeksempler, lenker til GitHub-repositorier og andre ressurser 
              som hjelper deg med a integrere mot Tilda-tjenesten.
            </p>
          </div>

          {/* GitHub Repositories */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub-repositorier
            </h2>
            <div className="grid gap-3">
              {REPOSITORIES.map((repo) => (
                <RepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Kodeeksempler
            </h2>
            
            {/* Example tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeExample === example.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>

            {/* Active example */}
            {CODE_EXAMPLES.filter((e) => e.id === activeExample).map((example) => (
              <div key={example.id} className="space-y-3">
                <p className="text-neutral-600">{example.description}</p>
                <CodeBlock code={example.code} language={example.language} />
              </div>
            ))}
          </div>

          {/* Useful Links */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Nyttige lenker</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {USEFUL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.title}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all digdir-card"
                  >
                    <Icon className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{link.title}</div>
                      <div className="text-sm text-neutral-500">{link.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Related pages */}
          <div className="digdir-card p-6 bg-neutral-50">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Relaterte sider</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/api"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">API-dokumentasjon</div>
                  <div className="text-sm text-neutral-500">Endepunkter og parametere</div>
                </div>
              </Link>
              <Link
                to="/datamodeller"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <Code className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Datamodeller</div>
                  <div className="text-sm text-neutral-500">JSON-skjemaer</div>
                </div>
              </Link>
              <Link
                to="/veiledninger"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <BookOpen className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="font-medium text-neutral-900">Veiledninger</div>
                  <div className="text-sm text-neutral-500">Steg-for-steg guider</div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
