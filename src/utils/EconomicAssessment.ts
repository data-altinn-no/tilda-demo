/**
 * Economic Assessment Algorithm
 * 
 * Evaluates an organization's financial health based on:
 * - AccountsInformation (regnskapstall) for 3 years
 * - TildaRegistryEntry (enhetsinformasjon)
 * 
 * Uses proff.no's formulas and rating scale:
 *   Lønnsomhet: Resultatgrad = (Ordinært resultat før skatt + Rentekostnader) / Driftsinntekter × 100
 *   Likviditet: Likviditetsgrad 1 = Omløpsmidler / Kortsiktig gjeld
 *   Soliditet: Egenkapitalandel = Egenkapital / Totalkapital × 100
 *   + Totalrentabilitet, Gjeldsgrad, Omsetningsvekst, Ansatteutvikling, Driftsstatus
 *
 * Rating scale (proff.no): Meget god, God, Tilfredsstillende, Svak, Ikke tilfredsstillende
 */

export interface AccountsInformationYear {
  // Regnskapsperiode
  fraDato: string;
  tilDato: string;

  // Resultatregnskap - Driftsinntekter
  salgsinntekter: number;
  sumDriftsinntekter: number;

  // Resultatregnskap - Driftskostnader
  loennskostnad: number;
  sumDriftskostnad: number;

  // Resultatregnskap - Driftsresultat
  driftsresultat: number;

  // Resultatregnskap - Finansposter
  sumFinansinntekter: number;
  rentekostnadSammeKonsern: number;
  annenRentekostnad: number;
  sumFinanskostnad: number;
  nettoFinans: number;

  // Resultatregnskap - Resultat
  ordinaertResultatFoerSkattekostnad: number;
  ordinaertResultatSkattekostnad: number;
  ekstraordinaerePoster: number;
  skattekostnadEkstraordinaertResultat: number;
  aarsresultat: number;
  totalresultat: number;

  // Balanse - Eiendeler
  goodwill: number;
  sumAnleggsmidler: number;
  sumVarer: number;
  sumFordringer: number;
  sumInvesteringer: number;
  sumBankinnskuddOgKontanter: number;
  sumOmloepsmidler: number;
  sumEiendeler: number;

  // Balanse - Egenkapital og gjeld
  sumInnskuttEgenkapital: number;
  sumOpptjentEgenkapital: number;
  sumEgenkapital: number;
  sumLangsiktigGjeld: number;
  sumKortsiktigGjeld: number;
  sumGjeld: number;
  sumEgenkapitalGjeld: number;

  // Ekstra felt (brukes i vurdering)
  antallAnsatte: number;
}

export interface EnhetsinformasjonInput {
  tildaenhet: string;
  tildaenhetNavn: string;
  naeringskode: string;
  organisasjonsform: string;
  driftsstatus: string;
}

export interface AssessmentIndicator {
  name: string;
  value: number | string;
  score: number; // 0-100
  level: 'kritisk' | 'svak' | 'akseptabel' | 'god' | 'utmerket';
  description: string;
}

export interface AltmanZScore {
  score: number;
  zone: 'Trygg sone' | 'Gråsone' | 'Faresone';
  components: {
    x1: number; // Working Capital / Total Assets
    x2: number; // Retained Earnings / Total Assets
    x3: number; // EBIT / Total Assets
    x4: number; // Equity / Total Liabilities
    x5: number; // Sales / Total Assets
  };
  description: string;
}

export interface RedFlag {
  rule: string;
  description: string;
  severity: 'kritisk' | 'alvorlig';
}

export interface AssessmentResult {
  totalScore: number;
  level: 'kritisk' | 'svak' | 'akseptabel' | 'god' | 'utmerket';
  summary: string;
  indicators: AssessmentIndicator[];
  riskFactors: string[];
  positiveFactors: string[];
  redFlags: RedFlag[];
  recommendation: string;
  altmanZScore: AltmanZScore;
}

/**
 * EconomicAssessment - Algorithm class for evaluating economic health
 */
export class EconomicAssessment {
  private accounts: AccountsInformationYear[];
  private enhet: EnhetsinformasjonInput;

  constructor(accounts: AccountsInformationYear[], enhet: EnhetsinformasjonInput) {
    this.accounts = accounts.sort((a, b) => a.fraDato.localeCompare(b.fraDato));
    this.enhet = enhet;
  }

  /**
   * Run the full assessment and return a result
   */
  evaluate(): AssessmentResult {
    const indicators: AssessmentIndicator[] = [];
    const riskFactors: string[] = [];
    const positiveFactors: string[] = [];

    // 1. Lønnsomhet - Resultatgrad (proff.no formel)
    indicators.push(this.assessResultatgrad());

    // 2. Soliditet - Egenkapitalandel (proff.no formel)
    indicators.push(this.assessEgenkapitalandel());

    // 3. Likviditet - Likviditetsgrad 1 (proff.no formel)
    indicators.push(this.assessLikviditet());

    // 4. Likviditetsgrad 2 (proff.no formel)
    indicators.push(this.assessLikviditetsgrad2());

    // 5. Totalrentabilitet (proff.no formel)
    indicators.push(this.assessTotalrentabilitet());

    // 6. Gjeldsgrad
    indicators.push(this.assessGjeldsgrad());

    // 7. Omsetningsvekst
    indicators.push(this.assessOmsetningsvekst());

    // 8. Ansatteutvikling
    indicators.push(this.assessAnsatteutvikling());

    // 9. Driftsstatus
    indicators.push(this.assessDriftsstatus());

    // Collect risk/positive factors
    for (const indicator of indicators) {
      if (indicator.score < 30) {
        riskFactors.push(`${indicator.name}: ${indicator.description}`);
      } else if (indicator.score >= 70) {
        positiveFactors.push(`${indicator.name}: ${indicator.description}`);
      }
    }

    // Red flag rules — override-level warnings
    const redFlags = this.detectRedFlags();

    // Calculate total score (weighted average)
    const weights = [18, 16, 12, 10, 12, 10, 10, 7, 5]; // Must sum to 100
    let totalScore = Math.round(
      indicators.reduce((sum, ind, i) => sum + ind.score * (weights[i] / 100), 0)
    );

    // Red flags with severity 'kritisk' force the score down
    const hasCriticalRedFlag = redFlags.some(f => f.severity === 'kritisk');
    if (hasCriticalRedFlag && totalScore > 25) {
      totalScore = 25;
    }

    const level = this.scoreToLevel(totalScore);
    const summary = this.generateSummary(totalScore, level, riskFactors, positiveFactors);
    const recommendation = this.generateRecommendation(level, riskFactors, indicators);

    const altmanZScore = this.computeAltmanZScore();

    return {
      totalScore,
      level,
      summary,
      indicators,
      riskFactors,
      positiveFactors,
      redFlags,
      recommendation,
      altmanZScore,
    };
  }

  private get latestYear(): AccountsInformationYear {
    return this.accounts[this.accounts.length - 1];
  }

  private get previousYear(): AccountsInformationYear | undefined {
    return this.accounts.length > 1 ? this.accounts[this.accounts.length - 2] : undefined;
  }

  private get firstYear(): AccountsInformationYear {
    return this.accounts[0];
  }

  private scoreToLevel(score: number): AssessmentIndicator['level'] {
    if (score >= 80) return 'utmerket';
    if (score >= 60) return 'god';
    if (score >= 40) return 'akseptabel';
    if (score >= 20) return 'svak';
    return 'kritisk';
  }

  // --- Individual Assessments (proff.no formulas) ---

  /**
   * Resultatgrad (proff.no Lønnsomhet)
   * Formel: (Ordinært resultat før skatt + Rentekostnader) / Driftsinntekter × 100
   * Skala: >15% Meget god, 10-15% God, 5-10% Tilfredsstillende, 1-5% Svak, <1% Ikke tilfredsstillende
   */
  private assessResultatgrad(): AssessmentIndicator {
    const latest = this.latestYear;
    const rentekostnader = latest.sumFinanskostnad;
    const resultatgrad = latest.sumDriftsinntekter > 0
      ? ((latest.ordinaertResultatFoerSkattekostnad + rentekostnader) / latest.sumDriftsinntekter) * 100
      : 0;

    let score: number;
    if (resultatgrad > 15) score = 100;
    else if (resultatgrad > 10) score = 80;
    else if (resultatgrad > 5) score = 60;
    else if (resultatgrad > 1) score = 40;
    else if (resultatgrad > -5) score = 20;
    else score = 0;

    const proffLevel = resultatgrad > 15 ? 'Meget god' : resultatgrad > 10 ? 'God' : resultatgrad > 5 ? 'Tilfredsstillende' : resultatgrad > 1 ? 'Svak' : 'Ikke tilfredsstillende';

    return {
      name: 'Resultatgrad (Lønnsomhet)',
      value: `${resultatgrad.toFixed(1)}%`,
      score,
      level: this.scoreToLevel(score),
      description: `${proffLevel} – Resultatgrad på ${resultatgrad.toFixed(1)}% (Ordinært resultat + rentekostnader i forhold til driftsinntekter)`,
    };
  }

  /**
   * Totalrentabilitet (proff.no)
   * Formel: (Resultat før skatt + Finanskostnader) / Gjennomsnittlig totalkapital × 100
   */
  private assessTotalrentabilitet(): AssessmentIndicator {
    const latest = this.latestYear;
    const prev = this.previousYear;
    const avgTotalkapital = prev
      ? (latest.sumEiendeler + prev.sumEiendeler) / 2
      : latest.sumEiendeler;

    const totalrentabilitet = avgTotalkapital > 0
      ? ((latest.ordinaertResultatFoerSkattekostnad + latest.sumFinanskostnad) / avgTotalkapital) * 100
      : 0;

    let score: number;
    if (totalrentabilitet > 15) score = 100;
    else if (totalrentabilitet > 10) score = 80;
    else if (totalrentabilitet > 5) score = 60;
    else if (totalrentabilitet > 0) score = 40;
    else score = 10;

    return {
      name: 'Totalrentabilitet',
      value: `${totalrentabilitet.toFixed(1)}%`,
      score,
      level: this.scoreToLevel(score),
      description: totalrentabilitet > 10
        ? `God avkastning på totalkapitalen (${totalrentabilitet.toFixed(1)}%)`
        : totalrentabilitet > 0
          ? `Moderat avkastning på totalkapitalen (${totalrentabilitet.toFixed(1)}%)`
          : `Negativ avkastning på totalkapitalen (${totalrentabilitet.toFixed(1)}%)`,
    };
  }

  /**
   * Egenkapitalandel (proff.no Soliditet)
   * Formel: Egenkapital / Totalkapital × 100
   * Skala: >40% Meget god, 20-40% God, 10-20% Tilfredsstillende, 5-10% Svak, <5% Ikke tilfredsstillende
   */
  private assessEgenkapitalandel(): AssessmentIndicator {
    const latest = this.latestYear;
    const totalKapital = latest.sumEiendeler > 0 ? latest.sumEiendeler : (latest.sumEgenkapital + latest.sumGjeld);
    const andel = totalKapital > 0
      ? (latest.sumEgenkapital / totalKapital) * 100
      : 0;

    let score: number;
    if (andel > 40) score = 100;
    else if (andel > 20) score = 80;
    else if (andel > 10) score = 60;
    else if (andel > 5) score = 40;
    else if (andel > 0) score = 20;
    else score = 0;

    const proffLevel = andel > 40 ? 'Meget god' : andel > 20 ? 'God' : andel > 10 ? 'Tilfredsstillende' : andel > 5 ? 'Svak' : 'Ikke tilfredsstillende';

    return {
      name: 'Egenkapitalandel (Soliditet)',
      value: `${andel.toFixed(1)}%`,
      score,
      level: this.scoreToLevel(score),
      description: `${proffLevel} – Egenkapitalandel på ${andel.toFixed(1)}% (egenkapital i forhold til totalkapital)`,
    };
  }

  /**
   * Likviditetsgrad 1 (proff.no Likviditet)
   * Formel: Omløpsmidler / Kortsiktig gjeld
   * Skala: >2 Meget god, 1.5-2 God, 1-1.5 Tilfredsstillende, 0.5-1 Svak, <0.5 Ikke tilfredsstillende
   */
  private assessLikviditet(): AssessmentIndicator {
    const latest = this.latestYear;
    const likviditetsgrad = latest.sumKortsiktigGjeld > 0
      ? latest.sumOmloepsmidler / latest.sumKortsiktigGjeld
      : 0;

    let score: number;
    if (likviditetsgrad > 2.0) score = 100;
    else if (likviditetsgrad > 1.5) score = 80;
    else if (likviditetsgrad > 1.0) score = 60;
    else if (likviditetsgrad > 0.5) score = 40;
    else score = 10;

    const proffLevel = likviditetsgrad > 2 ? 'Meget god' : likviditetsgrad > 1.5 ? 'God' : likviditetsgrad > 1 ? 'Tilfredsstillende' : likviditetsgrad > 0.5 ? 'Svak' : 'Ikke tilfredsstillende';

    return {
      name: 'Likviditetsgrad 1 (Likviditet)',
      value: likviditetsgrad.toFixed(2),
      score,
      level: this.scoreToLevel(score),
      description: `${proffLevel} – Likviditetsgrad 1 på ${likviditetsgrad.toFixed(2)} (omløpsmidler i forhold til kortsiktig gjeld)`,
    };
  }

  /**
   * Likviditetsgrad 2 (proff.no)
   * Formel: (Omløpsmidler - Varelager) / Kortsiktig gjeld
   * Skala: >1.5 Meget god, 1-1.5 God, 0.7-1 Tilfredsstillende, 0.4-0.7 Svak, <0.4 Ikke tilfredsstillende
   */
  private assessLikviditetsgrad2(): AssessmentIndicator {
    const latest = this.latestYear;
    const lg2 = latest.sumKortsiktigGjeld > 0
      ? (latest.sumOmloepsmidler - latest.sumVarer) / latest.sumKortsiktigGjeld
      : 0;

    let score: number;
    if (lg2 > 1.5) score = 100;
    else if (lg2 > 1.0) score = 80;
    else if (lg2 > 0.7) score = 60;
    else if (lg2 > 0.4) score = 40;
    else score = 10;

    const proffLevel = lg2 > 1.5 ? 'Meget god' : lg2 > 1 ? 'God' : lg2 > 0.7 ? 'Tilfredsstillende' : lg2 > 0.4 ? 'Svak' : 'Ikke tilfredsstillende';

    return {
      name: 'Likviditetsgrad 2',
      value: lg2.toFixed(2),
      score,
      level: this.scoreToLevel(score),
      description: `${proffLevel} \u2013 Likviditetsgrad 2 p\u00e5 ${lg2.toFixed(2)} (oml\u00f8psmidler minus varelager i forhold til kortsiktig gjeld)`,
    };
  }

  private assessGjeldsgrad(): AssessmentIndicator {
    const latest = this.latestYear;
    const gjeldsgrad = latest.sumEgenkapital > 0
      ? latest.sumGjeld / latest.sumEgenkapital
      : latest.sumGjeld > 0 ? 999 : 0;

    let score: number;
    if (gjeldsgrad <= 1.0) score = 100;
    else if (gjeldsgrad <= 2.0) score = 80;
    else if (gjeldsgrad <= 3.0) score = 60;
    else if (gjeldsgrad <= 5.0) score = 40;
    else if (gjeldsgrad <= 10.0) score = 20;
    else score = 0;

    return {
      name: 'Gjeldsgrad',
      value: gjeldsgrad >= 999 ? 'N/A (ingen EK)' : gjeldsgrad.toFixed(2),
      score,
      level: this.scoreToLevel(score),
      description: gjeldsgrad <= 2
        ? `Lav gjeldsgrad (${gjeldsgrad.toFixed(2)}), sunn finansiering`
        : gjeldsgrad <= 5
          ? `Moderat gjeldsgrad (${gjeldsgrad.toFixed(2)})`
          : `Høy gjeldsbelastning (${gjeldsgrad >= 999 ? 'ingen egenkapital' : gjeldsgrad.toFixed(2)})`,
    };
  }

  private assessOmsetningsvekst(): AssessmentIndicator {
    if (this.accounts.length < 2) {
      return {
        name: 'Omsetningsvekst',
        value: 'N/A',
        score: 50,
        level: 'akseptabel',
        description: 'Ikke nok data til å beregne vekst',
      };
    }

    const latest = this.latestYear;
    const first = this.firstYear;
    const years = this.accounts.length - 1;
    const totalGrowth = first.sumDriftsinntekter > 0
      ? ((latest.sumDriftsinntekter - first.sumDriftsinntekter) / first.sumDriftsinntekter) * 100
      : 0;
    const annualGrowth = totalGrowth / years;

    let score: number;
    if (annualGrowth >= 15) score = 100;
    else if (annualGrowth >= 8) score = 80;
    else if (annualGrowth >= 3) score = 60;
    else if (annualGrowth >= 0) score = 40;
    else if (annualGrowth >= -10) score = 20;
    else score = 0;

    return {
      name: 'Omsetningsvekst',
      value: `${annualGrowth.toFixed(1)}% p.a.`,
      score,
      level: this.scoreToLevel(score),
      description: annualGrowth >= 5
        ? `Positiv vekst på ${annualGrowth.toFixed(1)}% per år`
        : annualGrowth >= 0
          ? `Flat utvikling (${annualGrowth.toFixed(1)}% per år)`
          : `Negativ utvikling med ${annualGrowth.toFixed(1)}% årlig nedgang`,
    };
  }

  private assessAnsatteutvikling(): AssessmentIndicator {
    if (this.accounts.length < 2) {
      return {
        name: 'Ansatteutvikling',
        value: 'N/A',
        score: 50,
        level: 'akseptabel',
        description: 'Ikke nok data til å beregne endring',
      };
    }

    const latest = this.latestYear;
    const first = this.firstYear;
    const change = first.antallAnsatte > 0
      ? ((latest.antallAnsatte - first.antallAnsatte) / first.antallAnsatte) * 100
      : 0;

    let score: number;
    if (change >= 20) score = 100;
    else if (change >= 10) score = 80;
    else if (change >= 0) score = 60;
    else if (change >= -10) score = 40;
    else if (change >= -25) score = 20;
    else score = 0;

    return {
      name: 'Ansatteutvikling',
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      score,
      level: this.scoreToLevel(score),
      description: change >= 5
        ? `Vekst i antall ansatte (${change.toFixed(1)}%)`
        : change >= -5
          ? `Stabil bemanning (${change.toFixed(1)}%)`
          : `Reduksjon i bemanning (${change.toFixed(1)}%)`,
    };
  }

  private assessDriftsstatus(): AssessmentIndicator {
    const status = this.enhet.driftsstatus?.toLowerCase() || 'ok';

    let score: number;
    let description: string;
    if (status === 'ok' || status === '') {
      score = 100;
      description = 'Normal drift';
    } else if (status === 'underavvikling' || status === 'under avvikling') {
      score = 10;
      description = 'Virksomheten er under avvikling';
    } else if (status === 'konkurs') {
      score = 0;
      description = 'Virksomheten er under konkursbehandling';
    } else if (status.includes('tvangsavvikling') || status.includes('tvangsopploesning')) {
      score = 0;
      description = 'Under tvangsavvikling eller tvangsoppløsning';
    } else if (status === 'slettet') {
      score = 0;
      description = 'Virksomheten er slettet';
    } else {
      score = 50;
      description = `Driftsstatus: ${this.enhet.driftsstatus}`;
    }

    return {
      name: 'Driftsstatus',
      value: this.enhet.driftsstatus || 'OK',
      score,
      level: this.scoreToLevel(score),
      description,
    };
  }

  // --- Red Flag Detection ---

  /**
   * Detects critical patterns that override the normal score.
   * These are strong signals of financial distress regardless of other indicators.
   */
  private detectRedFlags(): RedFlag[] {
    const flags: RedFlag[] = [];
    const latest = this.latestYear;
    const sorted = this.accounts;

    // 1. Negativ egenkapital
    if (latest.sumEgenkapital < 0) {
      flags.push({
        rule: 'Negativ egenkapital',
        description: `Egenkapitalen er negativ (${latest.sumEgenkapital.toLocaleString('no-NO')} NOK). Selskapet har mer gjeld enn eiendeler, noe som indikerer teknisk insolvens. Styret har handleplikt etter aksjeloven § 3-5.`,
        severity: 'kritisk',
      });
    }

    // 2. Tre sammenhengende år med underskudd
    if (sorted.length >= 3) {
      const lastThree = sorted.slice(-3);
      const allLoss = lastThree.every(y => y.aarsresultat < 0);
      if (allLoss) {
        flags.push({
          rule: 'Tre år med underskudd',
          description: `Selskapet har hatt negativt årsresultat tre år på rad (${lastThree.map(y => y.fraDato.slice(0, 4)).join(', ')}). Vedvarende underskudd tærer på egenkapitalen og øker konkursrisikoen.`,
          severity: 'kritisk',
        });
      }
    }

    // 3. Omsetningskollaps (>50% fall)
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      if (prev.sumDriftsinntekter > 0) {
        const revenueChange = (latest.sumDriftsinntekter - prev.sumDriftsinntekter) / prev.sumDriftsinntekter;
        if (revenueChange < -0.5) {
          flags.push({
            rule: 'Omsetningskollaps',
            description: `Driftsinntektene har falt med ${Math.abs(Math.round(revenueChange * 100))}% fra forrige år. Et fall på over 50% er et alvorlig faresignal som kan indikere tap av nøkkelkunder eller markedssvikt.`,
            severity: 'kritisk',
          });
        } else if (revenueChange < -0.3) {
          flags.push({
            rule: 'Betydelig omsetningsfall',
            description: `Driftsinntektene har falt med ${Math.abs(Math.round(revenueChange * 100))}% fra forrige år. Et fall på over 30% krever nærmere vurdering.`,
            severity: 'alvorlig',
          });
        }
      }
    }

    // 4. Egenkapitalandel under lovens minstekrav (under halvparten av aksjekapitalen for AS)
    if (latest.sumEgenkapital > 0 && latest.sumEgenkapital < latest.sumInnskuttEgenkapital * 0.5) {
      flags.push({
        rule: 'Lav egenkapital ift. aksjekapital',
        description: `Egenkapitalen (${latest.sumEgenkapital.toLocaleString('no-NO')} NOK) er under halvparten av innskutt egenkapital. Dette kan utløse handleplikt etter aksjeloven § 3-5.`,
        severity: 'alvorlig',
      });
    }

    // 5. Negativ arbeidskapital med forverring
    const workingCapital = latest.sumOmloepsmidler - latest.sumKortsiktigGjeld;
    if (workingCapital < 0) {
      flags.push({
        rule: 'Negativ arbeidskapital',
        description: `Arbeidskapitalen er negativ (${workingCapital.toLocaleString('no-NO')} NOK). Kortsiktig gjeld overstiger omløpsmidlene, noe som kan gi betalingsproblemer på kort sikt.`,
        severity: 'alvorlig',
      });
    }

    // 6. Driftsstatus indikerer avvikling/konkurs
    const status = this.enhet.driftsstatus?.toLowerCase() || '';
    if (status === 'konkurs' || status.includes('tvangsavvikling') || status.includes('tvangsopploesning')) {
      flags.push({
        rule: 'Kritisk driftsstatus',
        description: `Virksomheten er registrert med driftsstatus «${this.enhet.driftsstatus}». Dette er et absolutt faresignal.`,
        severity: 'kritisk',
      });
    }

    return flags;
  }

  // --- Altman Z-Score ---

  /**
   * Altman Z-Score (privat selskap, modifisert modell)
   * Z' = 0.717×X1 + 0.847×X2 + 3.107×X3 + 0.420×X4 + 0.998×X5
   *
   * X1 = Arbeidskapital / Totalkapital
   * X2 = Opptjent egenkapital / Totalkapital
   * X3 = EBIT (Driftsresultat) / Totalkapital
   * X4 = Bokført egenkapital / Total gjeld
   * X5 = Omsetning / Totalkapital
   *
   * Soner: >2.9 Trygg, 1.23–2.9 Gråsone, <1.23 Faresone
   */
  private computeAltmanZScore(): AltmanZScore {
    const latest = this.latestYear;
    const totalAssets = latest.sumEiendeler || 1;
    const workingCapital = latest.sumOmloepsmidler - latest.sumKortsiktigGjeld;
    const totalLiabilities = latest.sumGjeld || 1;

    const x1 = workingCapital / totalAssets;
    const x2 = latest.sumOpptjentEgenkapital / totalAssets;
    const x3 = latest.driftsresultat / totalAssets;
    const x4 = latest.sumEgenkapital / totalLiabilities;
    const x5 = latest.sumDriftsinntekter / totalAssets;

    const score = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5;
    const roundedScore = Math.round(score * 100) / 100;

    let zone: AltmanZScore['zone'];
    let description: string;
    if (roundedScore > 2.9) {
      zone = 'Trygg sone';
      description = 'Lav sannsynlighet for konkurs. Selskapet har solid finansiell styrke.';
    } else if (roundedScore >= 1.23) {
      zone = 'Gråsone';
      description = 'Usikkert område. Selskapet bør overvåkes – moderat risiko for finansielle problemer.';
    } else {
      zone = 'Faresone';
      description = 'Høy sannsynlighet for finansielle problemer. Selskapet har flere kjennetegn på konkursrisiko.';
    }

    return {
      score: roundedScore,
      zone,
      components: {
        x1: Math.round(x1 * 1000) / 1000,
        x2: Math.round(x2 * 1000) / 1000,
        x3: Math.round(x3 * 1000) / 1000,
        x4: Math.round(x4 * 1000) / 1000,
        x5: Math.round(x5 * 1000) / 1000,
      },
      description,
    };
  }

  // --- Helpers ---

  private generateSummary(
    totalScore: number,
    level: string,
    riskFactors: string[],
    positiveFactors: string[]
  ): string {
    const name = this.enhet.tildaenhetNavn || this.enhet.tildaenhet;
    const base = `Økonomisk helhetsvurdering for ${name}: ${totalScore}/100 (${level}).`;

    if (riskFactors.length === 0 && positiveFactors.length > 0) {
      return `${base} Ingen vesentlige risikofaktorer identifisert.`;
    }
    if (riskFactors.length > 0) {
      return `${base} ${riskFactors.length} risikofaktor${riskFactors.length > 1 ? 'er' : ''} identifisert som krever oppmerksomhet.`;
    }
    return base;
  }

  private generateRecommendation(
    level: string,
    riskFactors: string[],
    indicators: AssessmentIndicator[]
  ): string {
    if (level === 'kritisk') {
      return 'Virksomheten har kritisk svak økonomi. Anbefaler skjerpet tilsynsfrekvens og vurdering av om virksomheten kan oppfylle sine forpliktelser.';
    }
    if (level === 'svak') {
      return 'Svak økonomisk situasjon. Anbefaler økt oppmerksomhet ved neste tilsyn, med fokus på ' +
        (riskFactors.length > 0 ? 'identifiserte risikoområder.' : 'den økonomiske utviklingen.');
    }
    if (level === 'akseptabel') {
      const weakIndicators = indicators.filter(i => i.score < 40);
      if (weakIndicators.length > 0) {
        return `Akseptabel samlet vurdering, men noen enkeltområder er svake: ${weakIndicators.map(i => i.name).join(', ')}. Normal tilsynsfrekvens anbefales.`;
      }
      return 'Akseptabel økonomisk situasjon. Normal tilsynsfrekvens anbefales.';
    }
    if (level === 'god') {
      return 'God økonomisk situasjon. Ingen grunn til økt tilsynsfrekvens basert på økonomi.';
    }
    return 'Utmerket økonomisk helsetilstand. Virksomheten fremstår som solid og veldrevet.';
  }
}
