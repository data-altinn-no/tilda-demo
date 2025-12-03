import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './ui';
import { isBrudd } from '../data/aggregators';

/**
 * Compliance Assessment Modal - Evaluates organization compliance
 */
export function ComplianceModal({ 
  isOpen, 
  onClose, 
  orgDetails, 
  rap, 
  koord, 
  meldinger, 
  financialData, 
  vehicleData, 
  propertyData, 
  roleData 
}) {
  if (!isOpen) return null;

  // Calculate compliance score based on various factors
  const calculateComplianceScore = () => {
    let score = 5; // Start with perfect score
    let factors = [];

    // 1. Supervision Reports Analysis (Weight: 40%)
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

    // 2. Financial Health (Weight: 25%)
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

    // 3. Coordination Issues (Weight: 20%)
    const koordineringIssues = koord.filter(k => 
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

    // 4. Messages from Authorities (Weight: 10%)
    const criticalMessages = meldinger.filter(m => 
      m.meldingsinnholdTilAnnenMyndighet?.meldingsType === 'oppfølging-av-funn'
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

    // 5. Role Management (Weight: 5%)
    if (roleData && roleData.length > 0) {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
      
      // Count recent role changes (roles that started within last 6 months)
      const recentRoleChanges = roleData.filter(r => {
        if (!r.gyldigFra) return false;
        const startDate = new Date(r.gyldigFra);
        return startDate >= sixMonthsAgo;
      }).length;
      
      // Count inactive/expired roles
      const inactiveRoles = roleData.filter(r => {
        if (!r.gyldigTil) return false;
        const expiryDate = new Date(r.gyldigTil);
        return expiryDate < now;
      }).length;
      
      // Count very frequent changes (more than 30% of roles changed in 6 months)
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

    // 6. Vehicle Compliance (Weight: 3%)
    if (vehicleData && vehicleData.length > 0) {
      const expiredVehicles = vehicleData.filter(v => {
        if (!v.kjoretoydata?.godkjenning?.gyldigTil) return false;
        const expiryDate = new Date(v.kjoretoydata.godkjenning.gyldigTil);
        const now = new Date();
        return expiryDate < now;
      }).length;

      const uninsuredVehicles = vehicleData.filter(v => 
        !v.kjoretoydata?.forsikring || v.kjoretoydata.forsikring.status !== 'Aktiv'
      ).length;

      if (expiredVehicles > 0 || uninsuredVehicles > 0) {
        const vehiclePenalty = expiredVehicles * 0.1 + uninsuredVehicles * 0.15;
        score -= vehiclePenalty;
        factors.push({
          category: 'Kjøretøy compliance',
          impact: -vehiclePenalty,
          description: `${expiredVehicles} utløpte godkjenninger, ${uninsuredVehicles} uforsikrede`,
          severity: uninsuredVehicles > 0 ? 'high' : 'medium'
        });
      }
    }

    // 7. Property Compliance (Weight: 2%)
    if (propertyData && propertyData.length > 0) {
      let propertyIssues = 0;
      let totalMortgageValue = 0;
      let totalPropertyValue = 0;

      propertyData.forEach(p => {
        totalPropertyValue += p.takst || 0;
        if (p.pantedokumenter) {
          p.pantedokumenter.forEach(pant => {
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
  };

  const assessment = calculateComplianceScore();

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 3.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 2.5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 4.5) return 'Høy compliance';
    if (score >= 3.5) return 'God compliance';
    if (score >= 2.5) return 'Moderat compliance';
    return 'Lav compliance';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Risiko-vurdering</h2>
            <p className="text-gray-600 mt-1">{orgDetails?.name || 'Organisasjon'}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <Card className={`border-2 ${getScoreColor(assessment.score)}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Samlet risikovurdering</h3>
                    <p className="text-sm opacity-80 mt-1">{getScoreLabel(assessment.score)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{assessment.score}</div>
                    <div className="text-sm opacity-80">av 5</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Vurderingsfaktorer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100">
                    {getSeverityIcon(factor.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{factor.category}</h4>
                        <div className="flex items-center gap-2">
                          {factor.impact !== 0 && (
                            <span className={`text-sm font-medium ${
                              factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {rap.filter(r => isBrudd(r)).length}
                    </div>
                    <div className="text-sm text-gray-600">Tilsynsbrudd</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {koord.filter(k => k.status === 'Fullført').length}
                    </div>
                    <div className="text-sm text-gray-600">Fullførte koordineringer</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {meldinger.length}
                    </div>
                    <div className="text-sm text-gray-600">Meldinger fra myndigheter</div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Mulighetsrom Statistics */}
              {roleData && roleData.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(() => {
                          const now = new Date();
                          const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
                          return roleData.filter(r => {
                            if (!r.gyldigFra) return false;
                            const startDate = new Date(r.gyldigFra);
                            return startDate >= sixMonthsAgo;
                          }).length;
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">Rolleendringer (6 mnd)</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {vehicleData && vehicleData.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {vehicleData.filter(v => 
                          !v.kjoretoydata?.forsikring || v.kjoretoydata.forsikring.status !== 'Aktiv'
                        ).length}
                      </div>
                      <div className="text-sm text-gray-600">Uforsikrede kjøretøy</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Anbefalinger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.score < 3 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800">Kritiske tiltak</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Anbefaler umiddelbar oppfølging og tilsynsplanlegging.
                      </p>
                    </div>
                  )}
                  
                  {assessment.score >= 3 && assessment.score < 4 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Moderat</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Fokuser på systematisk oppfølging av identifiserte risikoområder.
                      </p>
                    </div>
                  )}

                  {assessment.score >= 4 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800">God</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Fortsett med eksisterende rutiner og oppretthold høy standard.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-6">
              Lukk vurdering
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
