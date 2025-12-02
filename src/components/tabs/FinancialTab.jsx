import React from 'react';
import { TrendingUp, Users, Building2, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';

/**
 * Financial Tab Component - Displays economic information per year
 */
export function FinancialTab({ financialData }) {
  if (!financialData || !financialData.regnskapsaar || financialData.regnskapsaar.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingen økonomisk informasjon tilgjengelig</h3>
          <p className="text-gray-500">Denne organisasjonen har ingen registrerte regnskapsdata.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Ikke oppgitt';
    return amount.toLocaleString('no-NO') + ' NOK';
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'Ikke oppgitt';
    return value.toFixed(1) + '%';
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (!change) return '';
    return change > 0 ? '↗' : change < 0 ? '↘' : '→';
  };

  const getRiskColor = (rating) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating.startsWith('A')) return 'bg-green-100 text-green-800';
    if (rating.startsWith('BBB')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Sort years in descending order (most recent first)
  const sortedYears = [...financialData.regnskapsaar].sort((a, b) => b.aar - a.aar);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Økonomisk informasjon - {financialData.organisasjonsnavn}
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
            {sortedYears.length} år
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedYears.map((yearData, index) => (
          <Card key={yearData.aar} className={`transition-all hover:shadow-md ${
            index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <CardContent className="p-6">
              {/* Year Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{yearData.aar}</h3>
                    <p className="text-sm text-gray-600">
                      {yearData.regnskapsperiode.fraOgMed} - {yearData.regnskapsperiode.tilOgMed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Siste år
                    </Badge>
                  )}
                  <Badge className={getRiskColor(yearData.risikovurdering?.kredittvurdering)}>
                    {yearData.risikovurdering?.kredittvurdering || 'Ikke vurdert'}
                  </Badge>
                </div>
              </div>

              {/* Key Financial Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Revenue */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Omsetning</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(yearData.finansielleNokkeltal?.omsetning?.beloep)}
                  </div>
                  {yearData.finansielleNokkeltal?.omsetning?.endringFraForrigeAar && (
                    <div className={`text-sm ${getChangeColor(yearData.finansielleNokkeltal.omsetning.endringFraForrigeAar)}`}>
                      {getChangeIcon(yearData.finansielleNokkeltal.omsetning.endringFraForrigeAar)} 
                      {formatPercentage(yearData.finansielleNokkeltal.omsetning.endringFraForrigeAar)}
                    </div>
                  )}
                </div>

                {/* Operating Result */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Driftsresultat</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(yearData.finansielleNokkeltal?.driftsresultat?.beloep)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Margin: {formatPercentage(yearData.finansielleNokkeltal?.driftsresultat?.margin)}
                  </div>
                </div>

                {/* Employees */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Ansatte</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {yearData.ansatte?.antallAnsatte || 'Ikke oppgitt'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Omsetning/ansatt: {formatCurrency(yearData.ansatte?.produktivitet?.omsetningPerAnsatt)}
                  </div>
                </div>

                {/* Equity Ratio */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Egenkapitalandel</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(yearData.finansielleNokkeltal?.egenkapital?.egenkapitalandel)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(yearData.finansielleNokkeltal?.egenkapital?.beloep)}
                  </div>
                </div>
              </div>

              {/* Profitability Ratios */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3">Lønnsomhetsnøkkeltall</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 block">Bruttomargin</span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.bruttomargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Driftsmargin</span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.driftsmargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Nettemargin</span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.nettemargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">EK-rentabilitet</span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.egenkapitalrentabilitet)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">TK-rentabilitet</span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.totalkapitalrentabilitet)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Omløpshastighet</span>
                    <span className="font-medium">{yearData.loennsomhetsnoekkeltal?.omloepshastighet?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Industry Comparison & Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-2">Bransjesammenligning</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bransje:</span>
                      <span className="font-medium">{yearData.bransjesammenligning?.bransje}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Omsetning:</span>
                      <Badge className="text-xs">{yearData.bransjesammenligning?.posisjonOmsetning}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lønnsomhet:</span>
                      <Badge className="text-xs">{yearData.bransjesammenligning?.posisjonLoennsomhet}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soliditet:</span>
                      <Badge className="text-xs">{yearData.bransjesammenligning?.posisjonSoliditet}</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-2">Risikovurdering</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Konkursrisiko:</span>
                      <span className="font-medium">{yearData.risikovurdering?.konkursrisiko}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Betalingsevne:</span>
                      <span className="font-medium">{yearData.risikovurdering?.betalingsevne}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Finansiell stabilitet:</span>
                      <span className="font-medium">{yearData.risikovurdering?.finansiellStabilitet}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Trend Analysis Summary */}
        {financialData.trendanalyse && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trendanalyse
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-700 block font-medium">Omsetningsvekst</span>
                  <span className="text-green-900">{financialData.trendanalyse.omsetningsvekst?.treAarsSnitt}% (3-års snitt)</span>
                  <div className="text-green-700">{financialData.trendanalyse.omsetningsvekst?.trend}</div>
                </div>
                <div>
                  <span className="text-green-700 block font-medium">Lønnsomhet</span>
                  <span className="text-green-900">{financialData.trendanalyse.loennsomhetsutvikling?.trend}</span>
                  <div className="text-green-700">{financialData.trendanalyse.loennsomhetsutvikling?.driftsmarginsutvikling}</div>
                </div>
                <div>
                  <span className="text-green-700 block font-medium">Soliditet</span>
                  <span className="text-green-900">{financialData.trendanalyse.soliditetsutvikling?.trend}</span>
                  <div className="text-green-700">{financialData.trendanalyse.soliditetsutvikling?.egenkapitalandelsutvikling}</div>
                </div>
                <div>
                  <span className="text-green-700 block font-medium">Ansatte</span>
                  <span className="text-green-900">{financialData.trendanalyse.ansatteutvikling?.vekstrate}% vekst</span>
                  <div className="text-green-700">{financialData.trendanalyse.ansatteutvikling?.produktivitetsutvikling}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
