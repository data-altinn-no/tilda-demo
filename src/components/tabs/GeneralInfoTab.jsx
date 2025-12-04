import React from 'react';
import { Info, Circle, HelpCircle, ExternalLink, TrendingUp, Building2, ArrowUpRight } from 'lucide-react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { aggregateBrudd } from '../../data/aggregators.js';

// Colors for different authorities in the stacked bar chart
const AUTHORITY_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', 
  '#0891b2', '#c026d3', '#ea580c', '#4f46e5', '#059669',
  '#d97706', '#7c3aed', '#0d9488', '#e11d48'
];

/**
 * Aggregate tilsyn data by month and authority for combined chart
 * Includes both tilsyn counts per authority and brudd counts
 */
function aggregateTilsynByMonthAndAuthority(rap) {
  if (!rap || rap.length === 0) return { data: [], authorities: [] };
  
  const byMonthAndAuth = {};
  const bruddByMonth = {};
  const allAuthorities = new Set();
  
  rap.forEach(r => {
    if (!r.dato) return;
    const month = r.dato.substring(0, 7); // YYYY-MM
    const auth = r.tilsynsmyndighet || 'Ukjent';
    allAuthorities.add(auth);
    
    if (!byMonthAndAuth[month]) {
      byMonthAndAuth[month] = {};
      bruddByMonth[month] = 0;
    }
    byMonthAndAuth[month][auth] = (byMonthAndAuth[month][auth] || 0) + 1;
    
    // Count brudd (violations)
    const hasBrudd = r.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== 'Ingen';
    if (hasBrudd) {
      bruddByMonth[month] = (bruddByMonth[month] || 0) + 1;
    }
  });
  
  const authorities = Array.from(allAuthorities).sort();
  
  const data = Object.keys(byMonthAndAuth)
    .sort()
    .map(month => {
      const entry = { periode: month, brudd: bruddByMonth[month] || 0 };
      authorities.forEach(auth => {
        entry[auth] = byMonthAndAuth[month][auth] || 0;
      });
      return entry;
    });
  
  return { data, authorities };
}

/**
 * Check if organization qualifies as a "Gaselle" (high-growth company)
 * Criteria:
 * - Delivered approved financial statements (has regnskapsaar data)
 * - At least doubled revenue over the period
 * - Revenue over 1 million NOK
 * - Positive total operating result
 * - Revenue growth every year
 * - Is an AS (aksjeselskap)
 */
function isGazelleOrganisation(financialData, orgDetails) {
  if (!financialData?.regnskapsaar || financialData.regnskapsaar.length < 2) return false;
  if (!orgDetails) return false;

  // Must be AS (aksjeselskap)
  const isAS = orgDetails.organisationForm === 'Aksjeselskap' || orgDetails.organisationForm === 'AS';
  if (!isAS) return false;
  
  const years = financialData.regnskapsaar;
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  
  // Get revenues
  const firstRevenue = firstYear?.finansielleNokkeltal?.omsetning?.beloep || 0;
  const lastRevenue = lastYear?.finansielleNokkeltal?.omsetning?.beloep || 0;
  
  // Revenue over 1 million NOK
  if (lastRevenue < 1000000) return false;
  
  // At least doubled revenue
  if (lastRevenue < firstRevenue * 2) return false;
  
  // Check revenue growth every year and positive operating result
  let totalOperatingResult = 0;
  let previousRevenue = 0;
  
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const revenue = year?.finansielleNokkeltal?.omsetning?.beloep || 0;
    const operatingResult = year?.finansielleNokkeltal?.driftsresultat?.beloep || 0;
    
    totalOperatingResult += operatingResult;
    
    // Check revenue growth (skip first year)
    if (i > 0 && revenue <= previousRevenue) {
      return false; // Revenue did not grow this year
    }
    
    previousRevenue = revenue;
  }
  
  // Positive total operating result
  if (totalOperatingResult <= 0) return false;
  
  return true;
}

/**
 * Authority information with descriptions and website links
 */
const AUTHORITY_INFO = {
  "Miljødirektoratet": {
    description: "Statlig forvaltningsorgan for miljø og klima. Fører tilsyn med forurensning, naturmangfold og klimagassutslipp.",
    url: "https://www.miljodirektoratet.no"
  },
  "Arbeidstilsynet": {
    description: "Fører tilsyn med at virksomheter følger arbeidsmiljøloven. Fokus på HMS, arbeidsforhold og sikkerhet.",
    url: "https://www.arbeidstilsynet.no"
  },
  "Mattilsynet": {
    description: "Fører tilsyn med mat, dyr, planter og kosmetikk. Sikrer trygg mat og god dyrevelferd.",
    url: "https://www.mattilsynet.no"
  },
  "DSB": {
    description: "Direktoratet for samfunnssikkerhet og beredskap. Tilsyn med brann, el-sikkerhet og farlige stoffer.",
    url: "https://www.dsb.no"
  },
  "Fiskeridirektoratet": {
    description: "Forvalter fiskeri- og havbruksnæringen. Fører tilsyn med fiske, akvakultur og sjømat.",
    url: "https://www.fiskeridir.no"
  },
  "Konkurransetilsynet": {
    description: "Håndhever konkurranseloven. Fører tilsyn med konkurranseforhold og forebygger kartellvirksomhet.",
    url: "https://www.konkurransetilsynet.no"
  },
  "UU-tilsynet": {
    description: "Tilsynet for universell utforming. Fører tilsyn med IKT-løsninger og likestilling for funksjonshemmede.",
    url: "https://www.uutilsynet.no"
  },
  "Justervesenet": {
    description: "Fører tilsyn med måleinstrumenter og måleresultater. Sikrer riktige mål og vekt i handel.",
    url: "https://www.justervesenet.no"
  },
  "NSO": {
    description: "Norsk sertifisering og opplæring. Sertifiserer personell og utstyr innen løft og sikkerhet.",
    url: "https://www.nso.no"
  },
  "Helsetilsynet": {
    description: "Fører tilsyn med helse- og omsorgstjenester. Sikrer forsvarlige tjenester til befolkningen.",
    url: "https://www.helsetilsynet.no"
  },
  "Eltilsyn": {
    description: "Fører tilsyn med elektriske anlegg og utstyr. Sikrer el-sikkerhet og forebygger brann.",
    url: "https://www.dsb.no/lover/elektriske-anlegg-og-elektrisk-utstyr/"
  },
  "Branntilsyn": {
    description: "Lokalt brannvesen som fører tilsyn med brannsikkerhet i bygninger og virksomheter.",
    url: "https://www.dsb.no/lover/brannvern-brannvesen-nodnett/"
  },
  "Statsforvalteren i Agder": {
    description: "Statens representant i Agder. Fører tilsyn med kommuner og behandler klager på kommunale vedtak.",
    url: "https://www.statsforvalteren.no/agder"
  },
  "Statsforvalteren i Vestland": {
    description: "Statens representant i Vestland. Fører tilsyn med kommuner og behandler klager på kommunale vedtak.",
    url: "https://www.statsforvalteren.no/vestland"
  }
};

/**
 * Tooltip component for displaying help text on hover
 */
function InfoTooltip({ text }) {
  return (
    <div className="relative inline-block ml-1 group">
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center z-10">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}

/**
 * Tooltip component for authority with description and link
 */
function AuthorityTooltip({ authority }) {
  const info = AUTHORITY_INFO[authority];
  if (!info) return null;
  
  return (
    <div className="relative inline-block ml-1 group">
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10">
        <p className="mb-2">{info.description}</p>
        <a 
          href={info.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline"
          onClick={(e) => e.stopPropagation()}
        >
          Besøk nettside <ExternalLink className="w-3 h-3" />
        </a>
        <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}

/**
 * General Info Tab Component - Displays organization details and overview statistics
 */
export function GeneralInfoTab({ 
  orgDetails, 
  generatedFor, 
  bruddCount, 
  getStatusColor, 
  rap, 
  koord, 
  perMynd, 
  onAuthorityClick,
  fromDate,
  toDate,
  financialData,
  relatedCompanies,
  onRelatedCompanyClick
}) {
  // Check if organization is a gazelle
  const isGazelle = React.useMemo(() => 
    isGazelleOrganisation(financialData, orgDetails), 
    [financialData, orgDetails]
  );

  // Filter rap data based on date range
  const filteredRap = React.useMemo(() => {
    if (!fromDate && !toDate) return rap;
    return rap.filter(r => {
      const reportDate = r?.dato;
      if (!reportDate) return false;
      if (fromDate && reportDate < fromDate) return false;
      if (toDate && reportDate > toDate) return false;
      return true;
    });
  }, [rap, fromDate, toDate]);

  // Aggregate tilsyn by month and authority for stacked bar chart
  const { data: tilsynByMonthData, authorities: tilsynAuthorities } = React.useMemo(() => 
    aggregateTilsynByMonthAndAuthority(filteredRap), 
    [filteredRap]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Generell informasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Organization Details */}
        {orgDetails && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Organisasjonsnummer</div>
              <div className="text-lg font-semibold">{generatedFor}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Navn</div>
              <div className="text-lg font-semibold">{orgDetails.name}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Organisasjonsform</div>
              <div className="text-lg font-semibold">{orgDetails.organisationForm}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Adresse</div>
              <div className="text-lg font-semibold">{orgDetails.address}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Poststed</div>
              <div className="text-lg font-semibold">{orgDetails.zipcode} {orgDetails.city}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Næringskode</div>
              <div className="text-lg font-semibold">{orgDetails.naceCodeName}</div>
              <div className="text-xs text-gray-600 mt-1">{orgDetails.naceCode}</div>
            </div>
          </div>
        )}

        {/* Gazelle Indicator */}
        {isGazelle && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-amber-800 flex items-center gap-2">
                Gasellebedrift
                <InfoTooltip text="En gasellebedrift har levert godkjente regnskaper, minst doblet omsetningen, har omsetning over 1 million NOK, positivt samlet driftsresultat, omsetningsvekst hvert år, og er et aksjeselskap." />
              </div>
              <div className="text-sm text-amber-700">
                Denne organisasjonen kvalifiserer som en høyvekstbedrift
              </div>
            </div>
          </div>
        )}
        
        {/* Statistics Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Brudd
              <InfoTooltip text="Antall registrerte avvik eller regelbrudd fra tilsyn. Inkluderer alle funn med alvorlighetsgrad eller reaksjonstype. Status baseres på andel tilsyn med brudd." />
            </div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>{bruddCount}</div>
            <div className="text-sm text-gray-600 mt-1">
              {rap.length > 0 ? (
                <>
                  {Math.round((bruddCount / rap.length) * 100)}% av tilsyn
                  {bruddCount === 0 ? ' - Utmerket' : (bruddCount / rap.length) < 0.2 ? ' - Bra' : (bruddCount / rap.length) < 0.5 ? ' - Moderat' : ' - Kritisk'}
                </>
              ) : (
                'Ingen data'
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Utførte tilsyn
              <InfoTooltip text="Totalt antall gjennomførte tilsyn og kontroller registrert for denne organisasjonen fra alle tilsynsmyndigheter." />
            </div>
            <div className="text-xl font-semibold">{rap.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Fremtidige tilsyn
              <InfoTooltip text="Planlagte og koordinerte tilsyn som er registrert for fremtiden. Viser kommende tilsynsaktiviteter fra ulike myndigheter." />
            </div>
            <div className="text-xl font-semibold">{koord.length}</div>
          </div>
        </div>
        
        {/* Related Companies */}
        {relatedCompanies && relatedCompanies.companies && relatedCompanies.companies.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {relatedCompanies.type === 'parent' ? 'Morselskap' : `Datterselskaper (${relatedCompanies.companies.length})`}
            </div>
            <ul className="text-sm space-y-2">
              {relatedCompanies.companies.map((company) => (
                <li key={company.organisasjonsnummer} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">Org.nr: {company.organisasjonsnummer}</div>
                  </div>
                  <button
                    onClick={() => onRelatedCompanyClick(company.organisasjonsnummer, company.name)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Søk
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Authorities Involved */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Tilsynsmyndigheter med treff ({Object.keys(perMynd).length})</div>
          <ul className="text-sm space-y-1">
            {Object.keys(perMynd).map((authority) => {
              const authorityBrudd = perMynd[authority].reduce((sum, item) => sum + item.brudd, 0);
              const getAuthorityColor = () => {
                if (authorityBrudd === 0) return "text-green-500";
                if (authorityBrudd <= 5) return "text-yellow-500";
                return "text-red-500";
              };
              
              return (
                <li key={authority} className="flex items-center gap-2">
                  <Circle className={`w-1.5 h-1.5 fill-current ${getAuthorityColor()}`} />
                  <button 
                    onClick={() => onAuthorityClick(authority)}
                    className="truncate text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                  >
                    {authority} ({authorityBrudd})
                  </button>
                  <AuthorityTooltip authority={authority} />
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Combined Chart - Tilsyn by Authority (Bars) + Brudd Trend (Line) */}
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-3">
            Tilsyn og brudd per måned
            {fromDate && toDate && (
              <span className="text-xs text-gray-400 ml-2">
                ({fromDate} til {toDate})
              </span>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tilsynByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: 'Tilsyn', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'Brudd', angle: 90, position: 'insideRight', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {tilsynAuthorities.map((auth, index) => (
                  <Bar 
                    key={auth} 
                    dataKey={auth} 
                    stackId="tilsyn" 
                    yAxisId="left"
                    fill={AUTHORITY_COLORS[index % AUTHORITY_COLORS.length]}
                    name={auth}
                  />
                ))}
                <Line 
                  type="monotone" 
                  dataKey="brudd" 
                  yAxisId="right"
                  stroke="#000000" 
                  strokeWidth={3} 
                  dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
                  name="Brudd"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Søyler: Antall tilsyn per myndighet | Linje: Antall brudd
          </div>
        </div>
      </CardContent>
    </Card>
  );
}