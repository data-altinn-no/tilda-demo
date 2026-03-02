import { TrendingUp, Users, Building2, DollarSign, BarChart3, PieChart, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface InfoTooltipProps {
  text: string;
}

interface FinancialTabProps {
  financialData?: any;
  orgDetails?: any;
}

/**
 * Tooltip component for displaying help text on hover
 */
function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="relative inline-block ml-1 group">
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 text-center z-10">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}

/**
 * Financial Tab Component - Displays economic information per year
 */
export function FinancialTab({ financialData, orgDetails }: FinancialTabProps) {
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

  const formatCurrency = (amount?: number): string => {
    if (!amount) return 'Ikke oppgitt';
    return amount.toLocaleString('no-NO') + ' NOK';
  };

  const formatPercentage = (value?: number | null): string => {
    if (value === null || value === undefined) return 'Ikke oppgitt';
    return value.toFixed(1) + '%';
  };

  const getChangeColor = (change?: number | null): string => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getChangeIcon = (change?: number | null): string => {
    if (!change) return '';
    return change > 0 ? '↗' : change < 0 ? '↘' : '→';
  };

  const getRiskColor = (rating?: string): string => {
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
          Økonomisk informasjon - {orgDetails?.name || financialData.organisasjonsnavn}
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
            {sortedYears.length} år
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedYears.map((yearData, index) => {
          // Calculate changes from previous year
          const previousYearData = sortedYears[index + 1];
          const employeeChange = previousYearData ? 
            ((yearData.ansatte?.antallAnsatte - previousYearData.ansatte?.antallAnsatte) / previousYearData.ansatte?.antallAnsatte * 100) : null;
          
          const operatingResultChange = previousYearData ? 
            ((yearData.finansielleNokkeltal?.driftsresultat?.beloep - previousYearData.finansielleNokkeltal?.driftsresultat?.beloep) / previousYearData.finansielleNokkeltal?.driftsresultat?.beloep * 100) : null;
          
          const equityRatioChange = previousYearData ? 
            (yearData.finansielleNokkeltal?.egenkapital?.egenkapitalandel - previousYearData.finansielleNokkeltal?.egenkapital?.egenkapitalandel) : null;
          
          return (
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
                    <InfoTooltip text="Total inntekt fra salg av varer og tjenester. Viser hvor mye penger bedriften har tjent før utgifter trekkes fra." />
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
                    <InfoTooltip text="Overskudd fra den daglige driften, før renter og skatt. Positivt tall betyr at bedriften tjener penger på kjernevirksomheten." />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(yearData.finansielleNokkeltal?.driftsresultat?.beloep)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {operatingResultChange !== null && (
                      <div className={`${getChangeColor(operatingResultChange)} mb-1`}>
                        {getChangeIcon(operatingResultChange)} {formatPercentage(Math.abs(operatingResultChange))}                        
                      </div>
                    )}
                    Margin: {formatPercentage(yearData.finansielleNokkeltal?.driftsresultat?.margin)}
                  </div>
                </div>

                {/* Employees */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Ansatte</span>
                    <InfoTooltip text="Antall personer som jobber i bedriften. Endringer kan indikere vekst eller nedbemanning." />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {yearData.ansatte?.antallAnsatte || 'Ikke oppgitt'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {employeeChange !== null && (
                      <div className={`${getChangeColor(employeeChange)} mb-1`}>
                        {getChangeIcon(employeeChange)} {formatPercentage(Math.abs(employeeChange))}                         
                      </div>
                    )}
                    Omsetning/ansatt: {formatCurrency(yearData.ansatte?.produktivitet?.omsetningPerAnsatt)}
                  </div>
                </div>

                {/* Equity Ratio */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Egenkapitalandel</span>
                    <InfoTooltip text="Hvor mye av bedriftens verdier som er eid av eierne selv (ikke lånt). Høyere prosent betyr sterkere økonomi og mindre gjeld." />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(yearData.finansielleNokkeltal?.egenkapital?.egenkapitalandel)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {equityRatioChange !== null && (
                      <div className={`${getChangeColor(equityRatioChange)} mb-1`}>
                        {getChangeIcon(equityRatioChange)} {Math.abs(equityRatioChange).toFixed(1)}%
                      </div>
                    )}
                    {formatCurrency(yearData.finansielleNokkeltal?.egenkapital?.beloep)}
                  </div>
                </div>
              </div>

              {/* Profitability Ratios */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3">Lønnsomhetsnøkkeltall</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 flex items-center">
                      Bruttomargin
                      <InfoTooltip text="Hvor mye som er igjen av hver krone i omsetning etter varekostnader. Høyere er bedre." />
                    </span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.bruttomargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 flex items-center">
                      Driftsmargin
                      <InfoTooltip text="Andel av omsetningen som blir til overskudd fra driften. Viser hvor effektivt bedriften drives." />
                    </span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.driftsmargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 flex items-center">
                      Nettemargin
                      <InfoTooltip text="Endelig fortjeneste per krone omsatt, etter alle kostnader inkl. skatt. Det som faktisk blir igjen." />
                    </span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.nettemargin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 flex items-center">
                      EK-rentabilitet
                      <InfoTooltip text="Avkastning på eiernes investerte penger. Viser hvor god jobb bedriften gjør med eiernes kapital." />
                    </span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.egenkapitalrentabilitet)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 flex items-center">
                      TK-rentabilitet
                      <InfoTooltip text="Avkastning på all kapital i bedriften (både egen og lånt). Måler total effektivitet." />
                    </span>
                    <span className="font-medium">{formatPercentage(yearData.loennsomhetsnoekkeltal?.totalkapitalrentabilitet)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 flex items-center">
                      Omløpshastighet
                      <InfoTooltip text="Hvor mange ganger kapitalen 'brukes' i løpet av året. Høyere tall betyr mer effektiv bruk av ressurser." />
                    </span>
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
                      <span className="font-medium">{orgDetails?.naceCodeName || yearData.bransjesammenligning?.bransje}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NACE-kode:</span>
                      <span className="font-medium">{orgDetails?.naceCode || yearData.bransjesammenligning?.naceKode}</span>
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
          );
        })}

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
                  <span className="text-green-900">{financialData.trendanalyse.ansatteutvikling?.vekstrate}%</span>
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
