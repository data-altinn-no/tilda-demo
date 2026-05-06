import { useState, useCallback, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, Users, ChevronDown, ChevronRight, DollarSign, Shield, Droplets } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  EconomicAssessment,
  AccountsInformationYear,
  EnhetsinformasjonInput,
  AssessmentResult,
  AssessmentIndicator,
} from '../../utils/EconomicAssessment';
import { randInt } from '../../utils/randomHelpers';

interface EconomicAssessmentTabProps {
  orgDetails?: any;
  financialData?: any;
}

/**
 * Generate initial 3-year accounting data with all fields from Regnskapsregisteret API
 */
function generateInitialAccounts(financialData: any): AccountsInformationYear[] {
  const lastReportedYear = new Date().getFullYear() - 1;
  const years: AccountsInformationYear[] = [];

  for (let i = 2; i >= 0; i--) {
    const year = lastReportedYear - i;
    const existingYear = financialData?.regnskapsaar?.find((y: any) => y.aar === year);

    // Base figures (grow slightly per year)
    const growthFactor = 1 + (2 - i) * (Math.random() * 0.1 - 0.02);
    const baseRevenue = existingYear?.finansielleNokkeltal?.omsetning?.beloep || randInt(5000000, 50000000);
    const salgsinntekter = Math.round(baseRevenue * growthFactor * (0.85 + Math.random() * 0.15));
    const sumDriftsinntekter = Math.round(salgsinntekter * (1.0 + Math.random() * 0.1));
    const loennskostnad = Math.round(sumDriftsinntekter * (0.3 + Math.random() * 0.25));
    const sumDriftskostnad = Math.round(sumDriftsinntekter * (0.7 + Math.random() * 0.2));
    const driftsresultat = existingYear?.finansielleNokkeltal?.driftsresultat?.beloep || (sumDriftsinntekter - sumDriftskostnad);

    // Finansposter
    const sumFinansinntekter = randInt(10000, Math.round(sumDriftsinntekter * 0.02));
    const rentekostnadSammeKonsern = randInt(0, Math.round(sumDriftsinntekter * 0.005));
    const annenRentekostnad = randInt(50000, Math.round(sumDriftsinntekter * 0.03));
    const sumFinanskostnad = rentekostnadSammeKonsern + annenRentekostnad;
    const nettoFinans = sumFinansinntekter - sumFinanskostnad;

    // Resultat
    const ordinaertResultatFoerSkattekostnad = driftsresultat + nettoFinans;
    const ordinaertResultatSkattekostnad = Math.round(Math.max(0, ordinaertResultatFoerSkattekostnad) * 0.22);
    const ekstraordinaerePoster = 0;
    const skattekostnadEkstraordinaertResultat = 0;
    const aarsresultat = ordinaertResultatFoerSkattekostnad - ordinaertResultatSkattekostnad + ekstraordinaerePoster - skattekostnadEkstraordinaertResultat;
    const totalresultat = aarsresultat;

    // Balanse - Eiendeler
    const goodwill = Math.random() < 0.3 ? randInt(100000, 5000000) : 0;
    const sumAnleggsmidler = randInt(Math.round(sumDriftsinntekter * 0.2), Math.round(sumDriftsinntekter * 0.6)) + goodwill;
    const sumVarer = randInt(0, Math.round(sumDriftsinntekter * 0.1));
    const sumFordringer = randInt(Math.round(sumDriftsinntekter * 0.05), Math.round(sumDriftsinntekter * 0.2));
    const sumInvesteringer = randInt(0, Math.round(sumDriftsinntekter * 0.05));
    const sumBankinnskuddOgKontanter = randInt(Math.round(sumDriftsinntekter * 0.05), Math.round(sumDriftsinntekter * 0.15));
    const sumOmloepsmidler = sumVarer + sumFordringer + sumInvesteringer + sumBankinnskuddOgKontanter;
    const sumEiendeler = sumAnleggsmidler + sumOmloepsmidler;

    // Balanse - Egenkapital og gjeld
    const egenkapitalAndel = 0.2 + Math.random() * 0.4;
    const sumEgenkapital = existingYear?.finansielleNokkeltal?.egenkapital?.beloep || Math.round(sumEiendeler * egenkapitalAndel);
    const sumInnskuttEgenkapital = Math.round(sumEgenkapital * (0.3 + Math.random() * 0.3));
    const sumOpptjentEgenkapital = sumEgenkapital - sumInnskuttEgenkapital;
    const sumGjeld = existingYear?.finansielleNokkeltal?.gjeld?.totalGjeld || (sumEiendeler - sumEgenkapital);
    const sumKortsiktigGjeld = existingYear?.finansielleNokkeltal?.gjeld?.kortsiktigGjeld || Math.round(sumGjeld * (0.4 + Math.random() * 0.3));
    const sumLangsiktigGjeld = sumGjeld - sumKortsiktigGjeld;
    const sumEgenkapitalGjeld = sumEgenkapital + sumGjeld;

    const antallAnsatte = existingYear?.ansatte?.antallAnsatte || randInt(10, 200);

    years.push({
      fraDato: `${year}-01-01`,
      tilDato: `${year}-12-31`,
      salgsinntekter,
      sumDriftsinntekter,
      loennskostnad,
      sumDriftskostnad,
      driftsresultat,
      sumFinansinntekter,
      rentekostnadSammeKonsern,
      annenRentekostnad,
      sumFinanskostnad,
      nettoFinans,
      ordinaertResultatFoerSkattekostnad,
      ordinaertResultatSkattekostnad,
      ekstraordinaerePoster,
      skattekostnadEkstraordinaertResultat,
      aarsresultat,
      totalresultat,
      goodwill,
      sumAnleggsmidler,
      sumVarer,
      sumFordringer,
      sumInvesteringer,
      sumBankinnskuddOgKontanter,
      sumOmloepsmidler,
      sumEiendeler,
      sumInnskuttEgenkapital,
      sumOpptjentEgenkapital,
      sumEgenkapital,
      sumLangsiktigGjeld,
      sumKortsiktigGjeld,
      sumGjeld,
      sumEgenkapitalGjeld,
      antallAnsatte,
    });
  }

  return years;
}

function buildEnhetsinformasjon(orgDetails: any): EnhetsinformasjonInput {
  return {
    tildaenhet: orgDetails?.organisasjonsnummer || '',
    tildaenhetNavn: orgDetails?.name || '',
    naeringskode: orgDetails?.naceCode || '',
    organisasjonsform: orgDetails?.organisationForm || '',
    driftsstatus: 'ok',
  };
}

function getLevelColor(level: AssessmentIndicator['level']): string {
  switch (level) {
    case 'utmerket': return 'bg-green-100 text-green-800 border-green-200';
    case 'god': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'akseptabel': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'svak': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'kritisk': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Economic Assessment Tab - Presents accounting data for 3 years with editable fields
 * and runs an assessment algorithm.
 */
export function EconomicAssessmentTab({ orgDetails, financialData }: EconomicAssessmentTabProps) {
  const [accounts, setAccounts] = useState<AccountsInformationYear[]>(() =>
    generateInitialAccounts(financialData)
  );
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const enhet = buildEnhetsinformasjon(orgDetails);

  const handleFieldChange = useCallback((yearIndex: number, field: keyof AccountsInformationYear, value: string) => {
    // Allow minus sign and empty string as intermediate input states
    if (value === '' || value === '-') {
      setAccounts(prev => {
        const updated = [...prev];
        updated[yearIndex] = { ...updated[yearIndex], [field]: value === '-' ? -0 : 0 };
        return updated;
      });
      setResult(null);
      return;
    }
    const numVal = Number(value);
    if (!isNaN(numVal)) {
      setAccounts(prev => {
        const updated = [...prev];
        updated[yearIndex] = { ...updated[yearIndex], [field]: numVal };
        return updated;
      });
      setResult(null);
    }
  }, []);

  const [showDetails, setShowDetails] = useState(false);

  const runAssessment = useCallback(() => {
    setIsAssessing(true);
    // Simulate processing time
    setTimeout(() => {
      const assessment = new EconomicAssessment(accounts, enhet);
      const assessmentResult = assessment.evaluate();
      setResult(assessmentResult);
      setIsAssessing(false);
    }, 800);
  }, [accounts, enhet]);

  // Compute the three key indicators from latest year using proff.no's formulas and scale
  // Scale: Meget god, God, Tilfredsstillende, Svak, Ikke tilfredsstillende
  const keyIndicators = useMemo(() => {
    const latest = accounts[accounts.length - 1];
    const prev = accounts.length > 1 ? accounts[accounts.length - 2] : null;

    // 1. Lønnsomhet (Resultatgrad) = (Ordinært resultat før skatt + Rentekostnader) / Driftsinntekter × 100
    const rentekostnader = latest.sumFinanskostnad;
    const resultatgrad = latest.sumDriftsinntekter > 0
      ? ((latest.ordinaertResultatFoerSkattekostnad + rentekostnader) / latest.sumDriftsinntekter) * 100
      : 0;
    const prevRentekostnader = prev ? prev.sumFinanskostnad : 0;
    const prevResultatgrad = prev && prev.sumDriftsinntekter > 0
      ? ((prev.ordinaertResultatFoerSkattekostnad + prevRentekostnader) / prev.sumDriftsinntekter) * 100
      : null;

    // 2. Likviditet (Likviditetsgrad 1) = Omløpsmidler / Kortsiktig gjeld
    const likviditetsgrad = latest.sumKortsiktigGjeld > 0
      ? latest.sumOmloepsmidler / latest.sumKortsiktigGjeld
      : 0;
    const prevLikviditetsgrad = prev && prev.sumKortsiktigGjeld > 0
      ? prev.sumOmloepsmidler / prev.sumKortsiktigGjeld
      : null;

    // 3. Soliditet (Egenkapitalandel) = Egenkapital / Totalkapital × 100
    const totalKapital = latest.sumEiendeler > 0 ? latest.sumEiendeler : (latest.sumEgenkapital + latest.sumGjeld);
    const egenkapitalandel = totalKapital > 0
      ? (latest.sumEgenkapital / totalKapital) * 100
      : 0;
    const prevTotalKapital = prev ? (prev.sumEiendeler > 0 ? prev.sumEiendeler : (prev.sumEgenkapital + prev.sumGjeld)) : 0;
    const prevEgenkapitalandel = prev && prevTotalKapital > 0
      ? (prev.sumEgenkapital / prevTotalKapital) * 100
      : null;

    type ProffLevel = 'Meget god' | 'God' | 'Tilfredsstillende' | 'Svak' | 'Ikke tilfredsstillende';

    return {
      lonnsomhet: {
        value: resultatgrad,
        prev: prevResultatgrad,
        format: (v: number) => `${v.toFixed(1)}%`,
        label: 'Lønnsomhet',
        sublabel: 'Resultatgrad',
        icon: DollarSign,
        getLevel: (v: number): ProffLevel => v > 15 ? 'Meget god' : v > 10 ? 'God' : v > 5 ? 'Tilfredsstillende' : v > 1 ? 'Svak' : 'Ikke tilfredsstillende',
      },
      likviditet: {
        value: likviditetsgrad,
        prev: prevLikviditetsgrad,
        format: (v: number) => v.toFixed(2),
        label: 'Likviditet',
        sublabel: 'Likviditetsgrad 1',
        icon: Droplets,
        getLevel: (v: number): ProffLevel => v > 2 ? 'Meget god' : v > 1.5 ? 'God' : v > 1 ? 'Tilfredsstillende' : v > 0.5 ? 'Svak' : 'Ikke tilfredsstillende',
      },
      soliditet: {
        value: egenkapitalandel,
        prev: prevEgenkapitalandel,
        format: (v: number) => `${v.toFixed(1)}%`,
        label: 'Soliditet',
        sublabel: 'Egenkapitalandel',
        icon: Shield,
        getLevel: (v: number): ProffLevel => v > 40 ? 'Meget god' : v > 20 ? 'God' : v > 10 ? 'Tilfredsstillende' : v > 5 ? 'Svak' : 'Ikke tilfredsstillende',
      },
    };
  }, [accounts]);

  interface FieldDef {
    key: keyof AccountsInformationYear;
    label: string;
    isSummary?: boolean;
  }

  // Fields where an increase is negative for financial health (costs, debt, taxes)
  const inverseFields = new Set<keyof AccountsInformationYear>([
    'loennskostnad',
    'sumDriftskostnad',
    'rentekostnadSammeKonsern',
    'annenRentekostnad',
    'sumFinanskostnad',
    'ordinaertResultatSkattekostnad',
    'skattekostnadEkstraordinaertResultat',
    'sumLangsiktigGjeld',
    'sumKortsiktigGjeld',
    'sumGjeld',
  ]);

  // Fields that are totals/neutral — no positive/negative interpretation
  const neutralFields = new Set<keyof AccountsInformationYear>([
    'sumEiendeler',
    'sumEgenkapitalGjeld',
  ]);

  interface FieldSection {
    title: string;
    color: string;
    fields: FieldDef[];
  }

  const sections: FieldSection[] = [
    {
      title: 'Resultatregnskap – Driftsinntekter',
      color: 'bg-blue-50 text-blue-800',
      fields: [
        { key: 'salgsinntekter', label: 'Salgsinntekter' },
        { key: 'sumDriftsinntekter', label: 'Sum driftsinntekter', isSummary: true },
      ],
    },
    {
      title: 'Resultatregnskap – Driftskostnader',
      color: 'bg-blue-50 text-blue-800',
      fields: [
        { key: 'loennskostnad', label: 'Lønnskostnad' },
        { key: 'sumDriftskostnad', label: 'Sum driftskostnad', isSummary: true },
      ],
    },
    {
      title: 'Resultatregnskap – Driftsresultat',
      color: 'bg-blue-50 text-blue-800',
      fields: [
        { key: 'driftsresultat', label: 'Driftsresultat', isSummary: true },
      ],
    },
    {
      title: 'Resultatregnskap – Finansposter',
      color: 'bg-sky-50 text-sky-800',
      fields: [
        { key: 'sumFinansinntekter', label: 'Sum finansinntekter' },
        { key: 'rentekostnadSammeKonsern', label: 'Rentekostnad samme konsern' },
        { key: 'annenRentekostnad', label: 'Annen rentekostnad' },
        { key: 'sumFinanskostnad', label: 'Sum finanskostnad', isSummary: true },
        { key: 'nettoFinans', label: 'Netto finans', isSummary: true },
      ],
    },
    {
      title: 'Resultatregnskap – Resultat',
      color: 'bg-indigo-50 text-indigo-800',
      fields: [
        { key: 'ordinaertResultatFoerSkattekostnad', label: 'Ordinært resultat før skatt', isSummary: true },
        { key: 'ordinaertResultatSkattekostnad', label: 'Skattekostnad ordinært resultat' },
        { key: 'ekstraordinaerePoster', label: 'Ekstraordinære poster' },
        { key: 'skattekostnadEkstraordinaertResultat', label: 'Skattekostnad ekstraordinært resultat' },
        { key: 'aarsresultat', label: 'Årsresultat', isSummary: true },
        { key: 'totalresultat', label: 'Totalresultat', isSummary: true },
      ],
    },
    {
      title: 'Balanse – Eiendeler',
      color: 'bg-emerald-50 text-emerald-800',
      fields: [
        { key: 'goodwill', label: 'Goodwill' },
        { key: 'sumAnleggsmidler', label: 'Sum anleggsmidler', isSummary: true },
        { key: 'sumVarer', label: 'Sum varer' },
        { key: 'sumFordringer', label: 'Sum fordringer' },
        { key: 'sumInvesteringer', label: 'Sum investeringer' },
        { key: 'sumBankinnskuddOgKontanter', label: 'Sum bankinnskudd og kontanter' },
        { key: 'sumOmloepsmidler', label: 'Sum omløpsmidler', isSummary: true },
        { key: 'sumEiendeler', label: 'Sum eiendeler', isSummary: true },
      ],
    },
    {
      title: 'Balanse – Egenkapital og gjeld',
      color: 'bg-amber-50 text-amber-800',
      fields: [
        { key: 'sumInnskuttEgenkapital', label: 'Sum innskutt egenkapital' },
        { key: 'sumOpptjentEgenkapital', label: 'Sum opptjent egenkapital' },
        { key: 'sumEgenkapital', label: 'Sum egenkapital', isSummary: true },
        { key: 'sumLangsiktigGjeld', label: 'Sum langsiktig gjeld' },
        { key: 'sumKortsiktigGjeld', label: 'Sum kortsiktig gjeld' },
        { key: 'sumGjeld', label: 'Sum gjeld', isSummary: true },
        { key: 'sumEgenkapitalGjeld', label: 'Sum egenkapital og gjeld', isSummary: true },
      ],
    },
    {
      title: 'Ansatte',
      color: 'bg-purple-50 text-purple-800',
      fields: [
        { key: 'antallAnsatte', label: 'Antall ansatte' },
      ],
    },
  ];

  const getIndicatorColors = (level: string) => {
    switch (level) {
      case 'Meget god': return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', bar: 'bg-green-500', light: 'text-green-600' };
      case 'God': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', light: 'text-emerald-600' };
      case 'Tilfredsstillende': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500', light: 'text-yellow-600' };
      case 'Svak': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500', light: 'text-orange-600' };
      case 'Ikke tilfredsstillende': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', light: 'text-red-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', bar: 'bg-gray-500', light: 'text-gray-600' };
    }
  };

  const indicatorEntries = [keyIndicators.lonnsomhet, keyIndicators.likviditet, keyIndicators.soliditet];

  return (
    <div className="space-y-6">
      {/* Three key indicators - proff.no style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorEntries.map((indicator) => {
          const level = indicator.getLevel(indicator.value);
          const colors = getIndicatorColors(level);
          const Icon = indicator.icon;
          const change = indicator.prev !== null
            ? indicator.value - indicator.prev
            : null;

          return (
            <div
              key={indicator.label}
              className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/80 border ${colors.border}`}>
                    <Icon className={`w-5 h-5 ${colors.light}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{indicator.label}</h3>
                    <p className="text-xs text-gray-500">{indicator.sublabel}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {level}
                </Badge>
              </div>

              <div className="flex items-end justify-between">
                <div className={`text-3xl font-bold ${colors.text}`}>
                  {indicator.format(indicator.value)}
                </div>
                {change !== null && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                    <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0,
                    indicator.label === 'Likviditet'
                      ? (indicator.value / 2.5) * 100
                      : indicator.label === 'Lønnsomhet'
                        ? (indicator.value / 20) * 100
                        : (indicator.value / 50) * 100
                  ))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhetsinformasjon badges */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
          Org.nr: {enhet.tildaenhet || 'Ikke satt'}
        </Badge>
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
          Næring: {enhet.naeringskode || 'Ikke satt'}
        </Badge>
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
          Form: {enhet.organisasjonsform || 'Ikke satt'}
        </Badge>
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
          Status: {enhet.driftsstatus || 'OK'}
        </Badge>
        <span className="text-xs text-gray-400 ml-auto">Siste regnskapsår: {accounts[accounts.length - 1]?.fraDato.slice(0, 4)}</span>
      </div>

      {/* Collapsible detailed numbers */}
      <Card className="digdir-card overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            {showDetails
              ? <ChevronDown className="w-5 h-5 text-gray-500" />
              : <ChevronRight className="w-5 h-5 text-gray-500" />
            }
            <span className="font-semibold text-gray-800">Detaljerte regnskapstall</span>
            <span className="text-xs text-gray-500">({accounts.length} år, alle felt redigerbare)</span>
          </div>
          <span className="text-xs text-gray-400">
            {showDetails ? 'Skjul' : 'Vis'} tall fra Regnskapsregisteret
          </span>
        </button>

        {showDetails && (
          <>
            <div className="overflow-x-auto border-t border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[260px]">Regnskapsfelt</th>
                    {accounts.map((acc) => (
                      <th key={acc.fraDato} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[160px]">
                        {acc.fraDato.slice(0, 4)}
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 w-24">Endring</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <>
                      <tr key={`section-${section.title}`} className="border-t border-gray-200">
                        <td colSpan={accounts.length + 2} className={`py-2 px-4 text-xs font-bold uppercase tracking-wider ${section.color}`}>
                          {section.title}
                        </td>
                      </tr>
                      {section.fields.map((field) => {
                        const latestVal = accounts[accounts.length - 1][field.key] as number;
                        const firstVal = accounts[0][field.key] as number;
                        const change = firstVal !== 0
                          ? ((latestVal - firstVal) / Math.abs(firstVal)) * 100
                          : 0;

                        return (
                          <tr key={field.key} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 ${field.isSummary ? 'bg-gray-50/50' : ''}`}>
                            <td className={`py-2 px-4 ${field.isSummary ? 'font-semibold text-gray-900' : 'font-medium text-gray-700 pl-6'}`}>
                              <div className="flex items-center gap-1.5">
                                {field.key === 'antallAnsatte'
                                  ? <Users className="w-3.5 h-3.5 text-gray-400" />
                                  : field.isSummary
                                    ? <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                                    : null
                                }
                                {field.label}
                              </div>
                            </td>
                            {accounts.map((acc, yearIdx) => (
                              <td key={`${field.key}-${yearIdx}`} className="py-1.5 px-4 text-right">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={acc[field.key]}
                                  onChange={(e) => handleFieldChange(yearIdx, field.key, e.target.value)}
                                  className={`w-36 text-right border border-gray-200 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all ${
                                    field.isSummary ? 'font-semibold bg-gray-50' : ''
                                  }`}
                                  aria-label={`${field.label} ${acc.fraDato.slice(0, 4)}`}
                                />
                              </td>
                            ))}
                            <td className="py-2 px-4 text-right">
                              {(() => {
                                const isInverse = inverseFields.has(field.key);
                                const isNeutral = neutralFields.has(field.key);
                                const isPositiveChange = isInverse ? change < 0 : change > 0;
                                const isNegativeChange = isInverse ? change > 0 : change < 0;
                                const colorClass = isNeutral ? 'text-gray-500' : isPositiveChange ? 'text-green-600' : isNegativeChange ? 'text-red-600' : 'text-gray-500';
                                return (
                                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
                                    {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {change !== 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '\u2013'}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Run assessment button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Algoritmen vurderer lønnsomhet, soliditet, likviditet, gjeldsgrad, vekst, ansatteutvikling og driftsstatus.
          </p>
          <button
            onClick={runAssessment}
            disabled={isAssessing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              isAssessing
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
            }`}
          >
            {isAssessing ? (
              <>
                <div className="spinner w-4 h-4 border-gray-300 border-t-white"></div>
                Vurderer...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Vis detaljert vurdering
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Assessment Result */}
      {result && (
        <Card className="digdir-card overflow-hidden animate-in">
          <div className={`p-4 border-b ${
            result.level === 'utmerket' || result.level === 'god'
              ? 'bg-green-50 border-green-200'
              : result.level === 'akseptabel'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.totalScore >= 60
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <AlertTriangle className="w-6 h-6 text-orange-600" />
                }
                <div>
                  <h3 className="font-semibold text-gray-900">Vurderingsresultat</h3>
                  <p className="text-sm text-gray-600">{result.summary}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{result.totalScore}</div>
                <Badge className={getLevelColor(result.level)}>{result.level}</Badge>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Indikatorer</h4>
            <div className="grid gap-3">
              {result.indicators.map((indicator) => (
                <div key={indicator.name} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{indicator.name}</span>
                      <Badge className={`text-[10px] ${getLevelColor(indicator.level)}`}>{indicator.value}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{indicator.description}</p>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreBarColor(indicator.score)}`}
                          style={{ width: `${indicator.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-600 w-7 text-right">{indicator.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk & Positive factors */}
          {(result.riskFactors.length > 0 || result.positiveFactors.length > 0) && (
            <div className="px-6 pb-4 grid md:grid-cols-2 gap-4">
              {result.riskFactors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <h5 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Risikofaktorer
                  </h5>
                  <ul className="space-y-1">
                    {result.riskFactors.map((f, i) => (
                      <li key={i} className="text-xs text-red-700">• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.positiveFactors.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h5 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Positive faktorer
                  </h5>
                  <ul className="space-y-1">
                    {result.positiveFactors.map((f, i) => (
                      <li key={i} className="text-xs text-green-700">• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommendation */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h5 className="text-sm font-semibold text-indigo-800 mb-1">Anbefaling</h5>
              <p className="text-sm text-indigo-700">{result.recommendation}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Data source info */}
      <div className="text-xs text-gray-400 text-center">
        Datakilde: Brønnøysundregistrenes Regnskapsregister API – resultatregnskap (driftsinntekter, driftskostnader, finansposter, årsresultat), balanse (eiendeler, egenkapital, gjeld) + enhetsinformasjon (organisasjonsform, næringskode, driftsstatus)
      </div>
    </div>
  );
}
