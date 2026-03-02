import { isBrudd } from '../../data/aggregators';

interface AssessmentFactor {
  category: string;
  impact: number;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
}

interface AssessmentResult {
  score: number;
  factors: AssessmentFactor[];
}

interface AssessmentInput {
  rap: any[];
  koord: any[];
  meldinger: any[];
  financialData?: any;
  vehicleData?: any[];
  propertyData?: any[];
  roleData?: any[];
}

/**
 * Calculate compliance/risk score based on various organizational factors
 * @returns Assessment result with score and factors
 */
export function calculateComplianceScore({ rap, koord, meldinger, financialData, vehicleData, propertyData, roleData }: AssessmentInput): AssessmentResult {
  let score = 5;
  const factors: AssessmentFactor[] = [];

  const bruddReports = rap.filter(r => isBrudd(r));
  const totalBrudd = bruddReports.length;
  const criticalBrudd = bruddReports.filter(r => 
    r.funn_alvorlighetsgrad === 'Kritisk' || 
    r.funn_alvorlighetsgrad === 'Høy' ||
    r.reaksjonstype === 'Pålegg' ||
    r.reaksjonstype === 'Tvangsmulkt'
  ).length;

  if (totalBrudd > 0) {
    const bruddPenalty = Math.min(2, totalBrudd * 0.3 + criticalBrudd * 0.5);
    score -= bruddPenalty;
    factors.push({
      category: 'Tilsynsbrudd',
      impact: -bruddPenalty,
      description: `${totalBrudd} brudd funnet, ${criticalBrudd} kritiske`,
      severity: criticalBrudd > 0 ? 'critical' : totalBrudd > 3 ? 'high' : 'medium'
    });
  } else {
    factors.push({
      category: 'Tilsynsbrudd',
      impact: 0,
      description: 'Ingen brudd registrert',
      severity: 'good'
    });
  }

  if (financialData && financialData.regnskapsaar) {
    const latestYear = financialData.regnskapsaar[0];
    const egenkapitalandel = latestYear.finansielleNokkeltal?.egenkapital?.egenkapitalandel;
    const driftsresultat = latestYear.finansielleNokkeltal?.driftsresultat?.beloep;

    if (egenkapitalandel < 20) {
      score -= 0.8;
      factors.push({
        category: 'Finansiell stabilitet',
        impact: -0.8,
        description: `Lav egenkapitalandel: ${egenkapitalandel}%`,
        severity: 'high'
      });
    } else if (egenkapitalandel < 40) {
      score -= 0.3;
      factors.push({
        category: 'Finansiell stabilitet',
        impact: -0.3,
        description: `Moderat egenkapitalandel: ${egenkapitalandel}%`,
        severity: 'medium'
      });
    } else {
      factors.push({
        category: 'Finansiell stabilitet',
        impact: 0,
        description: `God egenkapitalandel: ${egenkapitalandel}%`,
        severity: 'good'
      });
    }

    if (driftsresultat < 0) {
      score -= 0.5;
      factors.push({
        category: 'Lønnsomhet',
        impact: -0.5,
        description: 'Negativt driftsresultat',
        severity: 'high'
      });
    }
  }

  const koordineringIssues = koord.filter((k: any) => 
    k.status === 'Avbrutt' || k.status === 'Forsinket'
  ).length;

  if (koordineringIssues > 2) {
    score -= 0.6;
    factors.push({
      category: 'Tilsynskoordinering',
      impact: -0.6,
      description: `${koordineringIssues} problematiske koordineringer`,
      severity: 'medium'
    });
  }

  const criticalMessages = meldinger.filter((m: any) => 
    m.meldingsinnholdTilAnnenMyndighet?.meldingsType === 'varsel-om-rapport'
  ).length;

  if (criticalMessages > 0) {
    score -= 0.4;
    factors.push({
      category: 'Myndighetsoppfølging',
      impact: -0.4,
      description: `${criticalMessages} oppfølgingsmeldinger`,
      severity: 'medium'
    });
  }

  if (roleData && roleData.length > 0) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    const recentRoleChanges = roleData.filter((r: any) => {
      if (!r.gyldigFra) return false;
      const startDate = new Date(r.gyldigFra);
      return startDate >= sixMonthsAgo;
    }).length;
    
    const inactiveRoles = roleData.filter((r: any) => {
      if (!r.gyldigTil) return false;
      const expiryDate = new Date(r.gyldigTil);
      return expiryDate < now;
    }).length;
    
    const roleChangeRate = roleData.length > 0 ? (recentRoleChanges / roleData.length) : 0;
    
    if (roleChangeRate > 0.3 || inactiveRoles > 2) {
      const rolePenalty = Math.min(0.4, roleChangeRate * 0.5 + inactiveRoles * 0.1);
      score -= rolePenalty;
      factors.push({
        category: 'Rolleforvaltning',
        impact: -rolePenalty,
        description: `${recentRoleChanges} nylige rolleendringer (${(roleChangeRate * 100).toFixed(0)}%), ${inactiveRoles} inaktive roller`,
        severity: roleChangeRate > 0.5 ? 'medium' : 'low'
      });
    } else if (recentRoleChanges > 0) {
      factors.push({
        category: 'Rolleforvaltning',
        impact: 0,
        description: `${recentRoleChanges} rolleendringer siste 6 mnd - normal aktivitet`,
        severity: 'good'
      });
    } else {
      factors.push({
        category: 'Rolleforvaltning',
        impact: 0,
        description: 'Stabil rollestruktur - ingen nylige endringer',
        severity: 'good'
      });
    }
  }

  if (vehicleData && vehicleData.length > 0) {
    const now = new Date();
    
    const overdueEUControl = vehicleData.filter((v: any) => {
      if (!v.nesteEUKontroll) return false;
      const nextControlDate = new Date(v.nesteEUKontroll);
      return nextControlDate < now;
    }).length;

    if (overdueEUControl > 0) {
      const vehiclePenalty = Math.min(0.5, overdueEUControl * 0.15);
      score -= vehiclePenalty;
      factors.push({
        category: 'Kjøretøy compliance',
        impact: -vehiclePenalty,
        description: `${overdueEUControl} kjøretøy med forfalt EU-kontroll`,
        severity: overdueEUControl > 2 ? 'high' : 'medium'
      });
    } else {
      factors.push({
        category: 'Kjøretøy compliance',
        impact: 0,
        description: 'Alle kjøretøy har gyldig EU-kontroll',
        severity: 'good'
      });
    }
  }

  if (propertyData && propertyData.length > 0) {
    let totalMortgageValue = 0;
    let totalPropertyValue = 0;

    propertyData.forEach((p: any) => {
      totalPropertyValue += p.takst || 0;
      if (p.pantedokumenter) {
        p.pantedokumenter.forEach((pant: any) => {
          if (pant.beloep && pant.beloep[0]) {
            totalMortgageValue += pant.beloep[0].grunnboksinformasjon || 0;
          }
        });
      }
    });

    const mortgageRatio = totalPropertyValue > 0 ? totalMortgageValue / totalPropertyValue : 0;
    
    if (mortgageRatio > 0.9) {
      score -= 0.3;
      factors.push({
        category: 'Eiendomsrisiko',
        impact: -0.3,
        description: `Høy belåningsgrad: ${(mortgageRatio * 100).toFixed(1)}%`,
        severity: 'medium'
      });
    }
  }

  return {
    score: Math.max(1, Math.min(5, Math.round(score * 10) / 10)),
    factors: factors
  };
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 3.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 2.5) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function getScoreLabel(score: number): string {
  if (score >= 4.5) return 'Lav risiko';
  if (score >= 3.5) return 'Moderat risiko';
  if (score >= 2.5) return 'Forhøyet risiko';
  return 'Høy risiko';
}

export function getRecentRoleChanges(roleData: any[]): number {
  if (!roleData || roleData.length === 0) return 0;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  return roleData.filter((r: any) => {
    if (!r.gyldigFra) return false;
    const startDate = new Date(r.gyldigFra);
    return startDate >= sixMonthsAgo;
  }).length;
}

export function getOverdueEUControlVehicles(vehicleData: any[]): number {
  if (!vehicleData || vehicleData.length === 0) return 0;
  const now = new Date();
  return vehicleData.filter((v: any) => {
    if (!v.nesteEUKontroll) return false;
    const nextControlDate = new Date(v.nesteEUKontroll);
    return nextControlDate < now;
  }).length;
}
