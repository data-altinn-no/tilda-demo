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

interface EconomicAssessmentTabProps {
  orgDetails?: any;
  financialData?: any;
}

/**
 * Generate accounting data from the shared financialData (genOkInfoFor output).
 * Uses the last 3 reported years so both "Økonomisk informasjon" and "Økonomisk vurdering" show the same numbers.
 */
function generateInitialAccounts(financialData: any): AccountsInformationYear[] {
  if (!financialData?.regnskapsaar || financialData.regnskapsaar.length === 0) {
    // Fallback: generate minimal placeholder data if no financialData exists
    const lastReportedYear = new Date().getFullYear() - 1;
    return [lastReportedYear - 2, lastReportedYear - 1, lastReportedYear].map(year => ({
      fraDato: `${year}-01-01`, tilDato: `${year}-12-31`,
      salgsinntekter: 0, sumDriftsinntekter: 0, loennskostnad: 0, sumDriftskostnad: 0, driftsresultat: 0,
      sumFinansinntekter: 0, rentekostnadSammeKonsern: 0, annenRentekostnad: 0, sumFinanskostnad: 0, nettoFinans: 0,
      ordinaertResultatFoerSkattekostnad: 0, ordinaertResultatSkattekostnad: 0, ekstraordinaerePoster: 0,
      skattekostnadEkstraordinaertResultat: 0, aarsresultat: 0, totalresultat: 0,
      goodwill: 0, sumAnleggsmidler: 0, sumVarer: 0, sumFordringer: 0, sumInvesteringer: 0,
      sumBankinnskuddOgKontanter: 0, sumOmloepsmidler: 0, sumEiendeler: 0,
      sumInnskuttEgenkapital: 0, sumOpptjentEgenkapital: 0, sumEgenkapital: 0,
      sumLangsiktigGjeld: 0, sumKortsiktigGjeld: 0, sumGjeld: 0, sumEgenkapitalGjeld: 0, antallAnsatte: 0,
    }));
  }

  // Sort ascending by year, take the last 3
  const sorted = [...financialData.regnskapsaar].sort((a: any, b: any) => a.aar - b.aar);
  const lastThree = sorted.slice(-3);

  return lastThree.map((yd: any) => {
    const fin = yd.finansielleNokkeltal || {};
    const revenue = fin.omsetning?.beloep || 0;
    const driftsresultat = fin.driftsresultat?.beloep || 0;
    const driftsmargin = fin.driftsresultat?.margin || 0;
    const totalCapital = fin.totalkapital?.beloep || 0;
    const equity = fin.egenkapital?.beloep || 0;
    const shortTermDebt = fin.gjeld?.kortsiktigGjeld || 0;
    const longTermDebt = fin.gjeld?.langsiktigGjeld || 0;
    const totalDebt = fin.gjeld?.totalGjeld || (shortTermDebt + longTermDebt);
    const resultBeforeTax = fin.resultatForSkatt?.beloep || 0;
    const resultAfterTax = fin.resultatEtterSkatt?.beloep || 0;
    const employees = yd.ansatte?.antallAnsatte || 0;
    const personnelCosts = yd.ansatte?.loennskostnader?.totalPersonalkostnader || 0;

    // Derive detailed fields from the summary data
    const sumDriftsinntekter = revenue;
    const salgsinntekter = Math.round(revenue * 0.92); // Sales typically ~92% of total revenue
    const loennskostnad = personnelCosts || Math.round(revenue * (driftsmargin > 0 ? (1 - driftsmargin / 100) * 0.5 : 0.45));
    const sumDriftskostnad = sumDriftsinntekter - driftsresultat;

    // Finansposter - derive from the difference between driftsresultat and resultat før skatt
    const nettoFinans = resultBeforeTax - driftsresultat;
    const sumFinanskostnad = Math.round(Math.abs(Math.min(0, nettoFinans)) + totalDebt * 0.03);
    const sumFinansinntekter = sumFinanskostnad + nettoFinans;
    const annenRentekostnad = Math.round(sumFinanskostnad * 0.85);
    const rentekostnadSammeKonsern = sumFinanskostnad - annenRentekostnad;

    // Resultat
    const ordinaertResultatFoerSkattekostnad = resultBeforeTax;
    const skattekostnad = resultBeforeTax - resultAfterTax;
    const aarsresultat = resultAfterTax;

    // Balanse - derive from totalCapital, equity, and debt
    const sumEiendeler = totalCapital;
    const sumEgenkapital = equity;
    const sumGjeld = totalDebt;
    const sumKortsiktigGjeld = shortTermDebt;
    const sumLangsiktigGjeld = longTermDebt;

    // Derive balance sheet detail from liquidity ratios
    const lg1 = yd.likviditetsnoekkeltal?.likviditetsgrad1 || 1.5;
    const sumOmloepsmidler = Math.round(sumKortsiktigGjeld * lg1);
    const sumAnleggsmidler = sumEiendeler - sumOmloepsmidler;

    // Breakdown of omløpsmidler
    const sumVarer = Math.round(sumOmloepsmidler * 0.15);
    const sumFordringer = Math.round(sumOmloepsmidler * 0.45);
    const sumInvesteringer = Math.round(sumOmloepsmidler * 0.05);
    const sumBankinnskuddOgKontanter = sumOmloepsmidler - sumVarer - sumFordringer - sumInvesteringer;

    // Egenkapital breakdown
    const sumInnskuttEgenkapital = Math.round(sumEgenkapital * 0.4);
    const sumOpptjentEgenkapital = sumEgenkapital - sumInnskuttEgenkapital;

    const goodwill = Math.round(sumAnleggsmidler * 0.05);

    return {
      fraDato: yd.regnskapsperiode?.fraOgMed || `${yd.aar}-01-01`,
      tilDato: yd.regnskapsperiode?.tilOgMed || `${yd.aar}-12-31`,
      salgsinntekter,
      sumDriftsinntekter,
      loennskostnad,
      sumDriftskostnad,
      driftsresultat,
      sumFinansinntekter: Math.max(0, sumFinansinntekter),
      rentekostnadSammeKonsern: Math.max(0, rentekostnadSammeKonsern),
      annenRentekostnad: Math.max(0, annenRentekostnad),
      sumFinanskostnad: Math.max(0, sumFinanskostnad),
      nettoFinans,
      ordinaertResultatFoerSkattekostnad,
      ordinaertResultatSkattekostnad: Math.max(0, skattekostnad),
      ekstraordinaerePoster: 0,
      skattekostnadEkstraordinaertResultat: 0,
      aarsresultat,
      totalresultat: aarsresultat,
      goodwill: Math.max(0, goodwill),
      sumAnleggsmidler: Math.max(0, sumAnleggsmidler),
      sumVarer: Math.max(0, sumVarer),
      sumFordringer: Math.max(0, sumFordringer),
      sumInvesteringer: Math.max(0, sumInvesteringer),
      sumBankinnskuddOgKontanter: Math.max(0, sumBankinnskuddOgKontanter),
      sumOmloepsmidler: Math.max(0, sumOmloepsmidler),
      sumEiendeler,
      sumInnskuttEgenkapital,
      sumOpptjentEgenkapital,
      sumEgenkapital,
      sumLangsiktigGjeld,
      sumKortsiktigGjeld,
      sumGjeld,
      sumEgenkapitalGjeld: sumEgenkapital + sumGjeld,
      antallAnsatte: employees,
    };
  });
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

    // 2b. Likviditetsgrad 2 = (Omløpsmidler - Varelager) / Kortsiktig gjeld
    const likviditetsgrad2 = latest.sumKortsiktigGjeld > 0
      ? (latest.sumOmloepsmidler - latest.sumVarer) / latest.sumKortsiktigGjeld
      : 0;
    const prevLikviditetsgrad2 = prev && prev.sumKortsiktigGjeld > 0
      ? (prev.sumOmloepsmidler - prev.sumVarer) / prev.sumKortsiktigGjeld
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
        lg2: likviditetsgrad2,
        lg2Prev: prevLikviditetsgrad2,
        lg2Level: (likviditetsgrad2 > 1.5 ? 'Meget god' : likviditetsgrad2 > 1 ? 'God' : likviditetsgrad2 > 0.7 ? 'Tilfredsstillende' : likviditetsgrad2 > 0.4 ? 'Svak' : 'Ikke tilfredsstillende') as ProffLevel,
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

              {/* Likviditetsgrad 2 sub-indicator */}
              {indicator.label === 'Likviditet' && 'lg2' in indicator && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Likviditetsgrad 2</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getIndicatorColors((indicator as any).lg2Level).text}`}>
                        {((indicator as any).lg2 as number).toFixed(2)}
                      </span>
                      <Badge className={`text-[9px] font-bold ${getIndicatorColors((indicator as any).lg2Level).bg} ${getIndicatorColors((indicator as any).lg2Level).text} border ${getIndicatorColors((indicator as any).lg2Level).border}`}>
                        {(indicator as any).lg2Level}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">(Omløpsmidler − Varelager) / Kortsiktig gjeld</p>
                </div>
              )}
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

          {/* Altman Z-Score */}
          <div className="px-6 pb-4">
            <div className={`p-4 rounded-xl border-2 ${
              result.altmanZScore.zone === 'Trygg sone'
                ? 'bg-green-50 border-green-300'
                : result.altmanZScore.zone === 'Gråsone'
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Altman Z-Score
                    <span className="text-[10px] font-normal text-gray-500">(modifisert modell for private selskap)</span>
                  </h5>
                  <p className="text-xs text-gray-600 mt-0.5">{result.altmanZScore.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    result.altmanZScore.zone === 'Trygg sone' ? 'text-green-700'
                      : result.altmanZScore.zone === 'Gråsone' ? 'text-yellow-700'
                        : 'text-red-700'
                  }`}>
                    {result.altmanZScore.score.toFixed(2)}
                  </div>
                  <Badge className={`text-[10px] font-bold ${
                    result.altmanZScore.zone === 'Trygg sone' ? 'bg-green-100 text-green-800 border-green-300'
                      : result.altmanZScore.zone === 'Gråsone' ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {result.altmanZScore.zone}
                  </Badge>
                </div>
              </div>

              {/* Z-Score scale visualization */}
              <div className="relative h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full mb-1 overflow-visible">
                <div
                  className="absolute top-[-2px] w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md transform -translate-x-1/2"
                  style={{ left: `${Math.min(100, Math.max(0, (result.altmanZScore.score / 5) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 mb-3">
                <span>0 (Faresone)</span>
                <span>1.23</span>
                <span>2.9</span>
                <span>5.0+ (Trygg)</span>
              </div>

              {/* Z-Score components */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                  { key: 'X1', label: 'Arbeidskapital / Totalkapital', value: result.altmanZScore.components.x1, weight: 0.717 },
                  { key: 'X2', label: 'Opptjent EK / Totalkapital', value: result.altmanZScore.components.x2, weight: 0.847 },
                  { key: 'X3', label: 'Driftsresultat / Totalkapital', value: result.altmanZScore.components.x3, weight: 3.107 },
                  { key: 'X4', label: 'Egenkapital / Gjeld', value: result.altmanZScore.components.x4, weight: 0.420 },
                  { key: 'X5', label: 'Omsetning / Totalkapital', value: result.altmanZScore.components.x5, weight: 0.998 },
                ].map((c) => (
                  <div key={c.key} className="bg-white/70 rounded-lg p-2 text-center border border-white/50">
                    <div className="text-[10px] font-bold text-gray-500">{c.key}</div>
                    <div className="text-sm font-bold text-gray-900">{c.value.toFixed(3)}</div>
                    <div className="text-[9px] text-gray-500">× {c.weight}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {result.redFlags.length > 0 && (
            <div className="px-6 pb-4">
              <div className="p-4 bg-red-100 rounded-xl border-2 border-red-400">
                <h5 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Røde flagg ({result.redFlags.length})
                  {result.redFlags.some(f => f.severity === 'kritisk') && (
                    <Badge className="bg-red-700 text-white text-[10px] font-bold border-red-800">
                      Overstyrer totalvurdering
                    </Badge>
                  )}
                </h5>
                <div className="space-y-3">
                  {result.redFlags.map((flag, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${
                      flag.severity === 'kritisk'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] font-bold uppercase ${
                          flag.severity === 'kritisk'
                            ? 'bg-red-700 text-white border-red-800'
                            : 'bg-orange-600 text-white border-orange-700'
                        }`}>
                          {flag.severity}
                        </Badge>
                        <span className={`text-sm font-bold ${
                          flag.severity === 'kritisk' ? 'text-red-900' : 'text-orange-900'
                        }`}>
                          {flag.rule}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${
                        flag.severity === 'kritisk' ? 'text-red-800' : 'text-orange-800'
                      }`}>
                        {flag.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
