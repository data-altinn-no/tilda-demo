import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Mock analytics data
 */
const ANALYTICS_DATA = {
  overview: {
    totalInspections: 2847,
    totalAuthorities: 23,
    activeCoordinations: 156,
    alertsSent: 89,
    monthlyGrowth: 12.5,
    complianceRate: 87.3
  },
  monthlyTrends: [
    { month: "Jan", inspections: 234, coordinations: 45, alerts: 12 },
    { month: "Feb", inspections: 267, coordinations: 52, alerts: 8 },
    { month: "Mar", inspections: 298, coordinations: 48, alerts: 15 },
    { month: "Apr", inspections: 312, coordinations: 61, alerts: 11 },
    { month: "Mai", inspections: 289, coordinations: 38, alerts: 9 },
    { month: "Jun", inspections: 345, coordinations: 67, alerts: 18 }
  ],
  topAuthorities: [
    { name: "Arbeidstilsynet", inspections: 456, growth: 8.2 },
    { name: "Mattilsynet", inspections: 389, growth: 15.7 },
    { name: "Miljødirektoratet", inspections: 298, growth: -2.1 },
    { name: "Justervesenet", inspections: 234, growth: 22.4 },
    { name: "Fiskeridirektoratet", inspections: 187, growth: 5.9 }
  ],
  inspectionTypes: [
    { type: "Planlagt tilsyn", count: 1456, percentage: 51.2 },
    { type: "Oppfølgingstilsyn", count: 678, percentage: 23.8 },
    { type: "Klagebehandling", count: 423, percentage: 14.9 },
    { type: "Uanmeldt tilsyn", count: 290, percentage: 10.1 }
  ],
  complianceData: [
    { category: "Arbeidsmiljø", compliant: 234, nonCompliant: 45, rate: 83.9 },
    { category: "Mattrygghet", compliant: 189, nonCompliant: 23, rate: 89.2 },
    { category: "Miljøvern", compliant: 156, nonCompliant: 34, rate: 82.1 },
    { category: "Sikkerhet", compliant: 298, nonCompliant: 67, rate: 81.6 }
  ]
};

/**
 * Stat card component
 */
function StatCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-700" },
    green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-700" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", text: "text-orange-700" },
    red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", text: "text-red-700" }
  };
  
  const colorScheme = colors[color] || colors.blue;
  
  return (
    <div className={`digdir-card p-6 ${colorScheme.border} border-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorScheme.bg}`}>
              <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Data analysis page
 */
export function DataAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  
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
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Dataanalyse</h1>
                <p className="text-neutral-600">Innsikt og statistikk fra Tilda-tjenesten</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="1m">Siste måned</option>
                  <option value="3m">Siste 3 måneder</option>
                  <option value="6m">Siste 6 måneder</option>
                  <option value="1y">Siste år</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                Oppdater
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Eksporter
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Totalt antall tilsyn"
              value={ANALYTICS_DATA.overview.totalInspections.toLocaleString()}
              subtitle="Siste 6 måneder"
              icon={FileText}
              trend={ANALYTICS_DATA.overview.monthlyGrowth}
              color="blue"
            />
            <StatCard
              title="Aktive myndigheter"
              value={ANALYTICS_DATA.overview.totalAuthorities}
              subtitle="Deltakende i Tilda"
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Koordineringer"
              value={ANALYTICS_DATA.overview.activeCoordinations}
              subtitle="Pågående samarbeid"
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Etterlevelsesgrad"
              value={`${ANALYTICS_DATA.overview.complianceRate}%`}
              subtitle="Gjennomsnittlig"
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <div className="digdir-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Månedlige trender</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.monthlyTrends.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600 w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Tilsyn: {month.inspections}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Koordinering: {month.coordinations}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Varsler: {month.alerts}</span>
                        </div>
                      </div>
                      <div className="mt-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(month.inspections / 400) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authorities */}
            <div className="digdir-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Mest aktive myndigheter</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.topAuthorities.map((authority, index) => (
                  <div key={authority.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-500 w-4">#{index + 1}</span>
                      <span className="text-sm font-medium text-neutral-900">{authority.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-600">{authority.inspections} tilsyn</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        authority.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {authority.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(authority.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inspection Types */}
            <div className="digdir-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tilsynstyper</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.inspectionTypes.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900">{type.type}</span>
                      <span className="text-sm text-neutral-600">{type.count} ({type.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Data */}
            <div className="digdir-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Etterlevelse per kategori</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.complianceData.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900">{category.category}</span>
                      <span className="text-sm text-neutral-600">{category.rate}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${category.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-500 w-16">{category.compliant + category.nonCompliant} tilsyn</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="digdir-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Om dataanalysen</h3>
                <p className="text-neutral-600 mb-3">
                  Denne siden viser aggregerte statistikker og trender basert på data som deles gjennom Tilda-tjenesten. 
                  Alle data er anonymiserte og presenteres på et overordnet nivå for å gi innsikt i tilsynsaktivitet 
                  på tvers av myndigheter.
                </p>
                <p className="text-neutral-600 text-sm">
                  <em>Merk: Dataene som vises her er genererte for demonstrasjonsformål og reflekterer ikke reelle tilsynsdata.</em>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
