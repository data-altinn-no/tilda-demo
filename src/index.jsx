import React, { useMemo, useState } from "react";
import { Info, Database, LineChart as LineChartIcon, Building2, RefreshCcw, Download, ListChecks, Circle, Mail, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Import extracted utilities and data functions
import { CITY_COORDINATES } from './constants.js';
import { downloadCSV, downloadJSON, flattenBruddByMyndighet } from './utils/exportHelpers.js';
import { 
  genTilsynskoordineringFor, 
  genTilsynsrapportFor, 
  genMeldingerFor, 
  genOrganisationDetailsFor 
} from './data/generators.js';
import { 
  isBrudd, 
  aggregateBrudd, 
  aggregateBruddByMyndighet 
} from './data/aggregators.js';

// Import extracted UI components
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from './components/ui';
import { MiniLineChart } from './components/charts';
import { DetailedBox } from './components/layout';
import { 
  GeneralInfoTab, 
  ReportsTab, 
  CoordinationTab, 
  TrendsTab, 
  MessagesTab, 
  ExperimentTab,
  DownloadTab 
} from './components/tabs';









/******************************
 * MAIN – Grafer + utlisting + statusikon (seed skjult til første oppslag)
 ******************************/
export default function TildaLookup() {
  const [orgnr, setOrgnr] = useState("123456789");
  const [koord, setKoord] = useState([]);
  const [rap, setRap] = useState([]);
  const [generatedFor, setGeneratedFor] = useState("");
  const [bruddCount, setBruddCount] = useState(0);
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [meldinger, setMeldinger] = useState([]);
  const [mulighetsrom, setMulighetsrom] = useState(false);
  const [orgDetails, setOrgDetails] = useState(null);
  const [selectedAuthority, setSelectedAuthority] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 9 characters
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 9);
    setOrgnr(cleaned);
  };

  const isValidOrgnr = orgnr.length === 9;

  const handleLookup = () => {
    if (!isValidOrgnr || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call with 1-2 second delay
    const delay = Math.random() * 1000 + 1000; // 1-2 seconds
    
    setTimeout(() => {
      const newRap = genTilsynsrapportFor(orgnr);
      const newKoord = genTilsynskoordineringFor(orgnr);
      const newMeldinger = genMeldingerFor(orgnr);
      const newOrgDetails = genOrganisationDetailsFor(orgnr);
      setRap(newRap);
      setKoord(newKoord);
      setMeldinger(newMeldinger);
      setOrgDetails(newOrgDetails);
      setGeneratedFor(orgnr);
      const totalBrudd = newRap.filter(isBrudd).length;
      setBruddCount(totalBrudd);
      setHasLookedUp(true);
      setIsLoading(false);
    }, delay);
  };

  const getStatusColor = () => {
    if (bruddCount === 0) return "text-green-500"; // Perfect
    if (bruddCount <= 5) return "text-yellow-500"; // Warning
    return "text-red-500"; // Critical
  };

  const handleAuthorityClick = (authority) => {
    setSelectedAuthority(authority);
    setActiveTab("rapporter");
  };

  const hasData = hasLookedUp && (rap.length > 0 || koord.length > 0);
  const perMynd = useMemo(()=> aggregateBruddByMyndighet(rap), [rap]);

  const baseTabs = [
    { id: "general", label: "Generell informasjon", icon: Info },
    { id: "rapporter", label: "Tilsynsrapporter", icon: Database },
    { id: "koordinering", label: "Tilsynskoordinering", icon: ListChecks },
    { id: "trends", label: "Trender", icon: LineChartIcon },
    { id: "meldinger", label: "Melding fra annen myndighet", icon: Mail },
    { id: "eksperiment", label: "Eksperiment", icon: Zap },
    { id: "download", label: "Eksporter data", icon: Download }
  ];
  
  const mulighetsromTabs = [
    { id: "okonomi", label: "Økonomisk informasjon", icon: Building2 },
    { id: "eiendommer", label: "Eiendommer", icon: Building2 },
    { id: "kjoretoy", label: "Kjøretøy", icon: Building2 }
  ];
  
  const tabs = mulighetsrom ? [...baseTabs, ...mulighetsromTabs] : baseTabs;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tilda - Innlogget for Tilsynstilsynet</h1>
        </div>
        <Button variant="outline" onClick={() => { setRap([]); setKoord([]); setMeldinger([]); setOrgDetails(null); setSelectedAuthority(null); setGeneratedFor(""); setBruddCount(0); setHasLookedUp(false); }}>
          <RefreshCcw className="w-4 h-4 mr-2" />Nullstill
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-3 items-center">
          <Input 
            className={`md:w-64 ${!isValidOrgnr && orgnr.length > 0 ? 'border-red-300 focus:ring-red-500' : ''}`}
            value={orgnr} 
            onChange={handleInputChange} 
            placeholder="Skriv orgnr (9 siffer)"
            maxLength={9}
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="mulighetsrom" 
              checked={mulighetsrom} 
              onChange={(e) => setMulighetsrom(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="mulighetsrom" className="text-sm font-medium text-gray-700">
              Mulighetsrom
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleLookup} 
              disabled={!isValidOrgnr || isLoading}
              className={(!isValidOrgnr || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Henter data...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />Slå opp
                </>
              )}
            </Button>
            {hasLookedUp && (<Circle className={`w-5 h-5 ${getStatusColor()}`} fill="currentColor" />)}
          </div>
          {hasLookedUp && generatedFor && (<Badge variant="secondary">Generert for {generatedFor}</Badge>)}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      {hasData && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      {hasData ? (
        <div>
          {activeTab === "general" && (
            <GeneralInfoTab 
              orgDetails={orgDetails}
              generatedFor={generatedFor}
              bruddCount={bruddCount}
              getStatusColor={getStatusColor}
              rap={rap}
              koord={koord}
              perMynd={perMynd}
              onAuthorityClick={handleAuthorityClick}
            />
          )}

          {activeTab === "rapporter" && (
            <DetailedBox 
              title="Tilsynsrapport – per myndighet (detaljer)" 
              rows={rap} 
              selectedAuthority={selectedAuthority}
              onClearSelection={() => setSelectedAuthority(null)}
            />
          )}

          {activeTab === "koordinering" && (
            <DetailedBox 
              title="Tilsynskoordinering – per myndighet (detaljer)" 
              rows={koord} 
              selectedAuthority={selectedAuthority}
              onClearSelection={() => setSelectedAuthority(null)}
            />
          )}

          {activeTab === "meldinger" && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Meldinger fra andre myndigheter ({selectedAuthority 
                      ? meldinger.filter(m => m.mottaker === selectedAuthority).length 
                      : meldinger.length})
                  </div>
                  {selectedAuthority && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Filtrert: {selectedAuthority}</Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedAuthority(null)}
                        className="text-xs px-2 py-1"
                      >
                        Fjern filter
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
              {meldinger.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Mail className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Ingen meldinger tilgjengelig</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {(selectedAuthority ? meldinger.filter(m => m.mottaker === selectedAuthority) : meldinger).map((melding) => {
                    const meldingDate = new Date(melding.datoForMeldingTilAnnenMyndighet);
                    const formatDate = (date) => {
                      return date.toLocaleDateString('no-NO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    };
                    const getMeldingTypeColor = (type) => {
                      switch(type) {
                        case 'varsel-om-rapport': return 'bg-blue-100 text-blue-800';
                        case 'forespørsel-om-informasjon': return 'bg-yellow-100 text-yellow-800';
                        case 'koordinering-av-tilsyn': return 'bg-green-100 text-green-800';
                        case 'oppfølging-av-funn': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };
                    return (
                      <Card key={melding.identifikator} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="font-medium text-sm">{melding.identifikator}</div>
                                <div className="text-xs text-gray-500">{formatDate(meldingDate)}</div>
                              </div>
                            </div>
                            <Badge className={getMeldingTypeColor(melding.meldingsinnholdTilAnnenMyndighet.meldingsType)}>
                              {melding.meldingsinnholdTilAnnenMyndighet.meldingsType}
                            </Badge>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mottaker:</span>
                              <span className="font-medium">{melding.mottaker}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tilda-enhet:</span>
                              <span className="font-medium">{melding.meldingOmTildaenhet}</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Meldingsinnhold:</div>
                            <div className="text-sm">{melding.meldingsinnholdTilAnnenMyndighet.fritekst}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              </CardContent>
            </Card>
          )}

          {activeTab === "trends" && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5" />
                      Trender
                    </div>
                    {selectedAuthority && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Filtrert: {selectedAuthority}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedAuthority(null)}
                          className="text-xs px-2 py-1"
                        >
                          Fjern filter
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedAuthority ? (
                      // Show only selected authority
                      perMynd[selectedAuthority] ? (
                        <MiniLineChart 
                          key={selectedAuthority} 
                          title={`${selectedAuthority} – brudd per måned`} 
                          data={perMynd[selectedAuthority]} 
                        />
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <LineChartIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600">Ingen data for {selectedAuthority}</p>
                        </div>
                      )
                    ) : (
                      // Show all authorities
                      Object.entries(perMynd).map(([mynd, data])=> (
                        <MiniLineChart key={mynd} title={`${mynd} – brudd per måned`} data={data} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Download className="w-5 h-5" />Eksporter data</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  <Button variant="outline" onClick={() => downloadCSV(rap, "tilsynsrapport.csv")}>
                    <Download className="w-4 h-4 mr-2" />Last ned rapporter (CSV)
                  </Button>
                  <Button variant="outline" onClick={() => downloadCSV(koord, "tilsynskoordinering.csv")}>
                    <Download className="w-4 h-4 mr-2" />Last ned koordinering (CSV)
                  </Button>
                  <Button variant="outline" onClick={() => downloadJSON(flattenBruddByMyndighet(perMynd), "brudd-per-myndighet.json")}>
                    <Download className="w-4 h-4 mr-2" />Last ned brudd (JSON)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "eksperiment" && (
            <ExperimentTab 
              rap={rap}
              selectedAuthority={selectedAuthority}
              onClearSelection={() => setSelectedAuthority(null)}
            />
          )}

          {activeTab === "download" && (
            <DownloadTab 
              rap={rap}
              koord={koord}
              perMynd={perMynd}
              selectedAuthority={selectedAuthority}
              onClearSelection={() => setSelectedAuthority(null)}
            />
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen data tilgjengelig</h3>
            <p className="text-muted-foreground">Skriv inn et gyldig organisasjonsnummer for å se tilsynsdata.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
