import React, { useMemo, useState } from "react";
import { Info, Database, LineChart as LineChartIcon, Building2, RefreshCcw, Download, ListChecks, Circle, Mail, Zap, Car, Users } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Import extracted utilities and data functions
import { CITY_COORDINATES } from './constants.js';
import { downloadCSV, downloadJSON, flattenBruddByMyndighet } from './utils/exportHelpers.js';
import { 
  genTilsynskoordineringFor, 
  genTilsynsrapportFor, 
  genMeldingerFor, 
  genOrganisationDetailsFor,
  genKjoretoyFor,
  genEiendommerFor,
  genRollerFor,
  genOkInfoFor 
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
  DownloadTab,
  VehiclesTab,
  PropertiesTab,
  RolesTab,
  FinancialTab 
} from './components/tabs';
import { ComplianceModal, InfoModal } from './components/modals';









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
  const [vehicleData, setVehicleData] = useState([]);
  const [propertyData, setPropertyData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [mulighetsrom, setMulighetsrom] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true); // Show on first visit
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
      const newVehicleData = genKjoretoyFor(orgnr);
      const newPropertyData = genEiendommerFor(orgnr);
      const newRoleData = genRollerFor(orgnr);
      const newFinancialData = genOkInfoFor(orgnr, newOrgDetails);
      setRap(newRap);
      setKoord(newKoord);
      setMeldinger(newMeldinger);
      setOrgDetails(newOrgDetails);
      setVehicleData(newVehicleData);
      setPropertyData(newPropertyData);
      setRoleData(newRoleData);
      setFinancialData(newFinancialData);
      setGeneratedFor(orgnr);
      const totalBrudd = newRap.filter(isBrudd).length;
      setBruddCount(totalBrudd);
      setHasLookedUp(true);
      setIsLoading(false);
    }, delay);
  };

  const getStatusColor = () => {
    if (bruddCount === 0) return "text-green-500"; // Perfect
    if (bruddCount <= 30) return "text-yellow-500"; // Warning
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
    { id: "rapporter", label: "Rapporter", icon: Database },
    { id: "koordinering", label: "Koordinering", icon: ListChecks },
    { id: "trends", label: "Trender", icon: LineChartIcon },
    { id: "meldinger", label: "Meldinger", icon: Mail },
    { id: "eksperiment", label: "Eksperiment", icon: Zap },
    { id: "download", label: "Eksporter data", icon: Download }
  ];
  
  const mulighetsromTabs = [
    { id: "okonomi", label: "Økonomisk informasjon", icon: Building2 },
    { id: "eiendommer", label: "Eiendommer", icon: Building2 },
    { id: "kjoretoy", label: "Kjøretøy", icon: Car },
    { id: "roller", label: "Roller", icon: Users }
  ];
  
  const tabs = mulighetsrom ? [...baseTabs, ...mulighetsromTabs] : baseTabs;

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-[95rem] mx-auto animate-in">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid gap-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
              Tilda
            </h1>
            <p className="text-neutral-600 font-medium mt-1 text-lg">Tilsynstilsynet Dashboard</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { setRap([]); setKoord([]); setMeldinger([]); setOrgDetails(null); setSelectedAuthority(null); setGeneratedFor(""); setBruddCount(0); setHasLookedUp(false); }}
            className="digdir-button digdir-button-secondary"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />Nullstill
          </Button>
        </div>

        {/* Search Card */}
        <div className="digdir-card p-8 bg-white">
          <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
            <div className="flex-1 w-full grid md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Organisasjonsnummer</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input 
                    className={`digdir-input pl-10 h-12 text-lg w-full ${!isValidOrgnr && orgnr.length > 0 ? 'border-danger text-danger' : ''}`}
                    value={orgnr} 
                    onChange={handleInputChange} 
                    placeholder="9 siffer"
                    maxLength={9}
                  />
                </div>
              </div>
              
              <div className="flex items-center h-12 mt-auto">
                <label className="flex items-center gap-3 p-3 rounded-digdir hover:bg-neutral-50 cursor-pointer transition-colors w-full border border-neutral-200">
                  <input 
                    type="checkbox" 
                    checked={mulighetsrom} 
                    onChange={(e) => setMulighetsrom(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-base font-medium text-neutral-700">Vis mulighetsrom</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              {hasLookedUp && generatedFor && (
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-700 border border-neutral-200 px-3 py-1 text-sm">
                  Generert for {generatedFor}
                </Badge>
              )}
              
              <Button 
                onClick={handleLookup} 
                disabled={!isValidOrgnr || isLoading}
                className={`h-12 px-8 text-base digdir-button min-w-[120px] ${
                  (!isValidOrgnr || isLoading) 
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                    : 'digdir-button-primary'
                }`}
              >
                Søk
              </Button>

              {hasData && mulighetsrom && (
                <Button 
                  onClick={() => setShowComplianceModal(true)}
                  className="h-12 px-8 text-base digdir-button min-w-[120px] bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Vurder
                </Button>
              )}
              
              {hasLookedUp && (
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-200">
                  <Circle className={`w-6 h-6 ${getStatusColor()}`} fill="currentColor" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {hasData && (
          <div className="flex flex-col gap-2">
            {/* Primary Tabs */}
            <div className="glass-card rounded-xl p-2">
              <nav className="flex flex-wrap items-center gap-1">
                {baseTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mulighetsrom Tabs (Secondary) */}
            {mulighetsrom && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-card rounded-xl p-2 bg-indigo-50/50 border-indigo-100/50"
              >
                <nav className="flex flex-wrap items-center gap-1">
                  <div className="px-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mr-2">
                    Mulighetsrom
                  </div>
                  {mulighetsromTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                          isActive
                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                            : 'text-indigo-600/70 hover:text-indigo-800 hover:bg-white/40'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-indigo-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </motion.div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="spinner w-6 h-6 border-blue-200 border-t-blue-600"></div>
              <span className="text-gray-600 font-medium">Henter data...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {hasData ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Content rendering logic remains mostly the same, just wrapped in motion div */}
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
              <MessagesTab 
                meldinger={meldinger}
                selectedAuthority={selectedAuthority}
                onClearSelection={() => setSelectedAuthority(null)}
              />
            )}

            {activeTab === "trends" && (
              <div className="grid gap-6">
                <Card className="digdir-card border-0 shadow-none bg-transparent">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                      <LineChartIcon className="w-6 h-6 text-neutral-500" />
                      Trender
                    </h2>
                    {selectedAuthority && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary-50 text-primary-800 border border-primary-100 px-3 py-1">Filtrert: {selectedAuthority}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedAuthority(null)}
                          className="digdir-button digdir-button-ghost text-xs"
                        >
                          Fjern filter
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-0">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedAuthority ? (
                        // Show only selected authority
                        perMynd[selectedAuthority] ? (
                          <MiniLineChart 
                            key={selectedAuthority} 
                            title={`${selectedAuthority} – brudd per måned`} 
                            data={perMynd[selectedAuthority]} 
                          />
                        ) : (
                          <div className="col-span-full text-center py-12 text-neutral-400 bg-white border border-neutral-200 rounded-digdir">
                            <LineChartIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Ingen data for {selectedAuthority}</p>
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
                
                <Card className="digdir-card p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                      <Download className="w-5 h-5 text-neutral-500" />
                      Eksporter data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 grid sm:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={() => downloadCSV(rap, "tilsynsrapport.csv")} className="digdir-button bg-white border border-neutral-200 h-auto py-6 flex flex-col gap-3 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                      <Download className="w-8 h-8 text-neutral-400 group-hover:text-primary-600" />
                      <span className="font-medium text-neutral-700 group-hover:text-primary-700">Last ned rapporter (CSV)</span>
                    </Button>
                    <Button variant="outline" onClick={() => downloadCSV(koord, "tilsynskoordinering.csv")} className="digdir-button bg-white border border-neutral-200 h-auto py-6 flex flex-col gap-3 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                      <Download className="w-8 h-8 text-neutral-400 group-hover:text-primary-600" />
                      <span className="font-medium text-neutral-700 group-hover:text-primary-700">Last ned koordinering (CSV)</span>
                    </Button>
                    <Button variant="outline" onClick={() => downloadJSON(flattenBruddByMyndighet(perMynd), "brudd-per-myndighet.json")} className="digdir-button bg-white border border-neutral-200 h-auto py-6 flex flex-col gap-3 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                      <Download className="w-8 h-8 text-neutral-400 group-hover:text-primary-600" />
                      <span className="font-medium text-neutral-700 group-hover:text-primary-700">Last ned brudd (JSON)</span>
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
                vehicleData={vehicleData}
                propertyData={propertyData}
                roleData={roleData}
                meldinger={meldinger}
                financialData={financialData}
                mulighetsrom={mulighetsrom}
                selectedAuthority={selectedAuthority}
                onClearSelection={() => setSelectedAuthority(null)}
              />
            )}

            {activeTab === "okonomi" && (
              <FinancialTab 
                financialData={financialData}
                orgDetails={orgDetails}
              />
            )}

            {activeTab === "eiendommer" && (
              <PropertiesTab 
                propertyData={propertyData}
                selectedAuthority={selectedAuthority}
                onClearSelection={() => setSelectedAuthority(null)}
              />
            )}

            {activeTab === "kjoretoy" && (
              <VehiclesTab 
                vehicleData={vehicleData}
                selectedAuthority={selectedAuthority}
                onClearSelection={() => setSelectedAuthority(null)}
              />
            )}

            {activeTab === "roller" && (
              <RolesTab 
                roleData={roleData}
                selectedAuthority={selectedAuthority}
                onClearSelection={() => setSelectedAuthority(null)}
              />
            )}
          </motion.div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto mt-8">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Database className="w-12 h-12 text-primary-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Ingen data å vise</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Søk etter et organisasjonsnummer i feltet over for å få tilgang til tilsynsdata, rapporter og analyser.
            </p>
          </div>
        )}
      </motion.div>

      {/* Compliance Assessment Modal */}
      <ComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        orgDetails={orgDetails}
        rap={rap}
        koord={koord}
        meldinger={meldinger}
        financialData={financialData}
        vehicleData={vehicleData}
        propertyData={propertyData}
        roleData={roleData}
      />

      {/* Info Modal - shown on first visit */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
