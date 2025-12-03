import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './ui';

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
    const totalBrudd = rap.filter(r => r.brudd && r.brudd.length > 0).length;
    const criticalBrudd = rap.filter(r => 
      r.brudd && r.brudd.some(b => 
        b.alvorlighetsgrad === 'Kritisk' || 
        b.alvorlighetsgrad === 'Høy'
      )
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
    const missingRoles = roleData.filter(r => 
      !r.person || r.person.trim() === ''
    ).length;

    if (missingRoles > 0) {
      score -= 0.2;
      factors.push({
        category: 'Rolleforvaltning',
        impact: -0.2,
        description: `${missingRoles} manglende rolleinnehavere`,
        severity: 'low'
      });
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
            <h2 className="text-2xl font-bold text-gray-900">Compliance-vurdering</h2>
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

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <Card className={`border-2 ${getScoreColor(assessment.score)}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Samlet compliance-score</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {rap.filter(r => r.brudd && r.brudd.length > 0).length}
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
                        Umiddelbar oppfølging av brudd og forbedring av compliance-rutiner anbefales.
                      </p>
                    </div>
                  )}
                  
                  {assessment.score >= 3 && assessment.score < 4 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Forbedringsområder</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Fokuser på systematisk oppfølging av identifiserte risikoområder.
                      </p>
                    </div>
                  )}

                  {assessment.score >= 4 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800">God compliance</h4>
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
