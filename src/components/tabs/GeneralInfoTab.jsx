import React, { useState } from 'react';
import { Info, Circle, HelpCircle, ExternalLink, TrendingUp, TrendingDown, Building2, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { isBrudd } from '../../data/aggregators.js';

// Colors for different authorities in the stacked bar chart
const AUTHORITY_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', 
  '#0891b2', '#c026d3', '#ea580c', '#4f46e5', '#059669',
  '#d97706', '#7c3aed', '#0d9488', '#e11d48'
];

/**
 * Generate dynamic periods by splitting the date range into 10 equal parts
 */
function generateDynamicPeriods(fromDate, toDate, numPeriods = 10) {
  const periods = [];
  
  if (!fromDate || !toDate) return periods;
  
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  const totalMs = endDate.getTime() - startDate.getTime();
  const periodMs = totalMs / numPeriods;
  
  for (let i = 0; i < numPeriods; i++) {
    const periodStart = new Date(startDate.getTime() + (i * periodMs));
    const periodEnd = new Date(startDate.getTime() + ((i + 1) * periodMs));
    
    periods.push({
      index: i,
      start: periodStart,
      end: periodEnd,
      label: formatPeriodLabel(periodStart, periodEnd)
    });
  }
  
  return periods;
}

/**
 * Format period label based on duration
 */
function formatPeriodLabel(start, end) {
  const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  
  if (startYear === endYear) {
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${startYear}`;
    }
    return `${startMonth}-${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear.toString().slice(-2)}-${endMonth} ${endYear.toString().slice(-2)}`;
}

/**
 * Aggregate tilsyn data by year for the chart
 * Shows all years from fromDate to current year, even if no data exists
 */
function aggregateTilsynByYear(rap, fromDate) {
  const yearData = {};
  
  // Determine year range: from fromDate year to current year
  const startYear = fromDate ? parseInt(fromDate.substring(0, 4)) : new Date().getFullYear() - 5;
  const currentYear = new Date().getFullYear();
  
  // Initialize all years in range with zero values
  for (let year = startYear; year <= currentYear; year++) {
    const yearStr = year.toString();
    yearData[yearStr] = {
      year: yearStr,
      tilsyn: 0,
      brudd: 0,
      myndigheter: new Set()
    };
  }
  
  // Aggregate actual data
  if (rap && rap.length > 0) {
    rap.forEach(r => {
      if (!r.dato) return;
      const year = r.dato.substring(0, 4);
      
      // Only count if year is in our range
      if (yearData[year]) {
        yearData[year].tilsyn++;
        yearData[year].myndigheter.add(r.tilsynsmyndighet || 'Ukjent');
        
        if (isBrudd(r)) {
          yearData[year].brudd++;
        }
      }
    });
  }
  
  return Object.values(yearData)
    .map(y => ({ ...y, myndigheter: y.myndigheter.size }))
    .sort((a, b) => a.year.localeCompare(b.year));
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
 * @param {string} text - The tooltip text
 * @param {string} position - 'top' (default) or 'bottom' for tooltip position
 */
function InfoTooltip({ text, position = 'top' }) {
  const isBottom = position === 'bottom';
  return (
    <div className="relative inline-block ml-1 group z-10">
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className={`absolute ${isBottom ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center z-[100]`}>
        {text}
        <div className={`absolute ${isBottom ? 'bottom-full border-b-gray-800' : 'top-full border-t-gray-800'} left-1/2 -translate-x-1/2 border-4 border-transparent`}></div>
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
  const [showYearlyOverview, setShowYearlyOverview] = useState(false);

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

  // Aggregate tilsyn by year for the chart
  const chartData = React.useMemo(() => 
    aggregateTilsynByYear(filteredRap, fromDate), 
    [filteredRap, fromDate]
  );

  // Aggregate yearly overview data - shows all years from fromDate to current year
  const yearlyOverview = React.useMemo(() => {
    const yearData = {};
    
    // Determine year range: from fromDate year to current year
    const startYear = fromDate ? parseInt(fromDate.substring(0, 4)) : new Date().getFullYear() - 5;
    const currentYear = new Date().getFullYear();
    
    // Initialize all years in range with zero values
    for (let year = startYear; year <= currentYear; year++) {
      const yearStr = year.toString();
      yearData[yearStr] = {
        year: yearStr,
        tilsyn: 0,
        brudd: 0,
        reaksjoner: 0,
        myndigheter: new Set()
      };
    }
    
    // Aggregate actual data
    rap.forEach(r => {
      if (!r.dato) return;
      const year = r.dato.substring(0, 4);
      
      // Only count if year is in our range
      if (yearData[year]) {
        yearData[year].tilsyn++;
        yearData[year].myndigheter.add(r.tilsynsmyndighet);
        
        // Count tilsyn with brudd (not total funn) to match aggregated bruddCount
        if (isBrudd(r)) {
          yearData[year].brudd++;
        }
        
        // Count reaksjoner from funn array
        if (r.funn && r.funn.length > 0) {
          r.funn.forEach(f => {
            if (f.reaksjonstype && f.reaksjonstype !== 'Ingen') {
              yearData[year].reaksjoner++;
            }
          });
        } else if (r.reaksjonstype && r.reaksjonstype !== 'Ingen') {
          yearData[year].reaksjoner++;
        }
      }
    });
    
    return Object.values(yearData)
      .map(y => ({ ...y, myndigheter: y.myndigheter.size }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [rap, fromDate]);

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

        {/* Annual Turnover - Last 3 Years */}
        {financialData?.regnskapsaar && financialData.regnskapsaar.length > 0 && (() => {
          const sortedYears = [...financialData.regnskapsaar].sort((a, b) => a.aar - b.aar).slice(-3);
          return (
            <div className="grid md:grid-cols-3 gap-4">
              {sortedYears.map((year, index) => {
                const turnover = year.finansielleNokkeltal?.omsetning?.beloep || 0;
                const formattedTurnover = new Intl.NumberFormat('nb-NO', {
                  style: 'currency',
                  currency: 'NOK',
                  maximumFractionDigits: 0
                }).format(turnover);
                
                // Compare with previous year in array (which is the earlier year chronologically)
                const prevYearData = sortedYears[index - 1];
                const previousTurnover = prevYearData?.finansielleNokkeltal?.omsetning?.beloep || 0;
                
                // Calculate percentage change
                const percentChange = prevYearData && previousTurnover > 0
                  ? ((turnover - previousTurnover) / previousTurnover) * 100
                  : null;
                
                const isPositive = percentChange !== null && percentChange >= 0;
                const colorClass = percentChange === null ? 'text-gray-700' : isPositive ? 'text-green-600' : 'text-red-600';
                
                return (
                  <div key={year.aar} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Omsetning {year.aar}</div>
                    <div className={`text-lg font-semibold ${colorClass}`}>{formattedTurnover}</div>
                    {percentChange !== null && (
                      <div className={`flex items-center gap-1 text-sm mt-1 ${colorClass}`}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

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
        
        {/* Statistics Row - Clickable */}
        <button
          type="button"
          onClick={() => setShowYearlyOverview(!showYearlyOverview)}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between text-sm font-medium text-gray-700 mt-2 mb-2">
            <span>Treff i angitt tidsperiode</span>
            <span className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              {showYearlyOverview ? 'Skjul' : 'Vis'} årsoversikt
              {showYearlyOverview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm text-gray-600 flex items-center">
                Antall tilsynsmyndigheter
                <InfoTooltip text="Antall unike tilsynsmyndigheter som har utført tilsyn på denne organisasjonen i valgt periode." />
              </div>
              <div className="text-xl font-semibold">{Object.keys(perMynd).length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
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
            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm text-gray-600 flex items-center">
                Utførte tilsyn
                <InfoTooltip text="Totalt antall gjennomførte tilsyn og kontroller registrert for denne organisasjonen fra alle tilsynsmyndigheter." />
              </div>
              <div className="text-xl font-semibold">{rap.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm text-gray-600 flex items-center">
                Fremtidige tilsyn
                <InfoTooltip text="Planlagte og koordinerte tilsyn som er registrert for fremtiden. Viser kommende tilsynsaktiviteter fra ulike myndigheter." />
              </div>
              <div className="text-xl font-semibold">{koord.length}</div>
            </div>
          </div>
        </button>
        
        {/* Yearly Overview Table - Transposed: years as columns, metrics as rows */}
        {showYearlyOverview && yearlyOverview.length > 0 && (() => {
          const sortedYears = [...yearlyOverview].sort((a, b) => a.year.localeCompare(b.year));
          return (
            <div className="bg-white border border-gray-200 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 sticky left-0 bg-gray-50"></th>
                    {sortedYears.map(row => (
                      <th key={row.year} className="text-center px-4 py-3 font-medium text-gray-700 min-w-[80px]">
                        {row.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white">
                      <span className="flex items-center">
                        Tilsyn
                      </span>
                    </td>
                    {sortedYears.map(row => (
                      <td key={row.year} className="px-4 py-2 text-center text-gray-700">{row.tilsyn}</td>
                    ))}
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white">
                      <span className="flex items-center">
                        Brudd
                      </span>
                    </td>
                    {sortedYears.map(row => (
                      <td key={row.year} className="px-4 py-2 text-center">
                        <span className={row.brudd > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {row.brudd}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-gray-50">
                      <span className="flex items-center">
                        Reaksjoner
                      </span>
                    </td>
                    {sortedYears.map(row => (
                      <td key={row.year} className="px-4 py-2 text-center">
                        <span className={row.reaksjoner > 0 ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                          {row.reaksjoner}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-gray-50">
                      <span className="flex items-center">
                        Myndigheter
                      </span>
                    </td>
                    {sortedYears.map(row => (
                      <td key={row.year} className="px-4 py-2 text-center text-gray-700">{row.myndigheter}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}
        
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
                    <div className="text-xs text-gray-500">Org.nr: {company.organisasjonsnummer} | {company.address}, {company.zipcode} {company.city}</div>
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
        
        {/* Grouped Bar Chart - Tilsyn, Brudd, Myndigheter per year */}
        <div className="mt-6" role="figure" aria-labelledby="chart-title" aria-describedby="chart-description">
          <div id="chart-title" className="text-sm text-gray-600 mb-3">
            Tilsyn, brudd og tilsynsmyndigheter per år
            {fromDate && toDate && (
              <span className="text-xs text-gray-400 ml-2">
                ({fromDate} til {toDate})
              </span>
            )}
          </div>
          {/* Screen reader description for chart data */}
          <div id="chart-description" className="sr-only">
            Graf som viser antall tilsyn, brudd og tilsynsmyndigheter per år. 
            {chartData && chartData.length > 0 && (
              `Totalt ${chartData.reduce((sum, d) => sum + (d.tilsyn || 0), 0)} tilsyn og ${chartData.reduce((sum, d) => sum + (d.brudd || 0), 0)} brudd i perioden.`
            )}
          </div>
          <div className="h-64" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <p className="font-medium text-gray-900 mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar 
                  dataKey="tilsyn"
                  fill="#6366f1"
                  name="Tilsyn"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="brudd"
                  fill="#dc2626"
                  name="Brudd"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="myndigheter"
                  fill="#16a34a"
                  name="Myndigheter"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}