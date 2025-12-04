import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';
import { isBrudd } from '../../data/aggregators';
import { 
  calculateComplianceScore, 
  getScoreColor, 
  getScoreLabel,
  getRecentRoleChanges,
  getOverdueEUControlVehicles
} from './assessmentLogic';

/**
 * Compliance/Risk Assessment Modal - Displays risk evaluation for an organization
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

  const assessment = calculateComplianceScore({
    rap, koord, meldinger, financialData, vehicleData, propertyData, roleData
  });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center pt-4 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-xl">
        {/* Header */}
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

        {/* Scrollable Content */}
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
                        {getRecentRoleChanges(roleData)}
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
                        {getOverdueEUControlVehicles(vehicleData)}
                      </div>
                      <div className="text-sm text-gray-600">Forfalt EU-kontroll</div>
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-6">
              Lukk vurdering
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
