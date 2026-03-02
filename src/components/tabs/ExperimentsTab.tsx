import { Zap, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NorwayMap } from '../ui/NorwayMap';
import { isBrudd } from '../../data/aggregators';

interface ExperimentsTabProps {
  rap: any[];
  selectedAuthority: string | null;
  onClearSelection: () => void;
}

/**
 * Experiment Tab Component - Displays geographic heatmap and Norway map
 */
export function ExperimentsTab({ rap, selectedAuthority, onClearSelection }: ExperimentsTabProps) {
  const cityViolations: Record<string, number> = {};
  const filteredRap = selectedAuthority ? rap.filter(r => r.tilsynsmyndighet === selectedAuthority) : rap;
  filteredRap.forEach(r => {
    if (r.tilsynsadresse && isBrudd(r)) {
      const addressParts = r.tilsynsadresse.split(', ');
      if (addressParts.length >= 2) {
        const cityPart = addressParts[addressParts.length - 1];
        const city = cityPart.replace(/^\d{4,5}\s+/, '');
        cityViolations[city] = (cityViolations[city] || 0) + 1;
      }
    }
  });

  const maxViolations = Math.max(...Object.values(cityViolations), 1);
  const getHeatColor = (count: number): string => {
    const intensity = count / maxViolations;
    if (intensity === 0) return 'bg-gray-100 text-gray-600';
    if (intensity <= 0.25) return 'bg-yellow-200 text-yellow-800';
    if (intensity <= 0.5) return 'bg-orange-300 text-orange-900';
    if (intensity <= 0.75) return 'bg-red-400 text-red-900';
    return 'bg-red-600 text-white';
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Eksperiment - Geografisk Heatmap
          </div>
          {selectedAuthority && (
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Filtrert: {selectedAuthority}</Badge>
              <Button 
                variant="outline" 
                onClick={onClearSelection}
                className="text-xs px-2 py-1"
              >
                Fjern filter
              </Button>
            </div>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Visualisering av bruddstetthet per by basert på tilsynsadresser
          {selectedAuthority && ` - kun data fra ${selectedAuthority}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <NorwayMap 
            cityViolations={cityViolations} 
            maxViolations={maxViolations}
          />
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Brudd per by</h4>
              <div className="flex items-center gap-2 text-xs">
                <span>Lav</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-yellow-200 border"></div>
                  <div className="w-4 h-4 bg-orange-300 border"></div>
                  <div className="w-4 h-4 bg-red-400 border"></div>
                  <div className="w-4 h-4 bg-red-600 border"></div>
                </div>
                <span>Høy</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(cityViolations)
                .sort(([,a], [,b]) => b - a)
                .map(([city, count]) => (
                <div 
                  key={city} 
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getHeatColor(count)}`}
                >
                  <div className="font-semibold text-lg">{city}</div>
                  <div className="text-sm opacity-90">{count} brudd</div>
                  <div className="text-xs opacity-75 mt-1">
                    {((count / maxViolations) * 100).toFixed(0)}% av maks
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Statistikk
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Totalt byer</div>
                <div className="font-semibold">{Object.keys(cityViolations).length}</div>
              </div>
              <div>
                <div className="text-gray-600">Totalt brudd</div>
                <div className="font-semibold">{Object.values(cityViolations).reduce((a, b) => a + b, 0)}</div>
              </div>
              <div>
                <div className="text-gray-600">Gjennomsnitt per by</div>
                <div className="font-semibold">
                  {Object.keys(cityViolations).length > 0 
                    ? (Object.values(cityViolations).reduce((a, b) => a + b, 0) / Object.keys(cityViolations).length).toFixed(1)
                    : '0'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-600">Høyeste by</div>
                <div className="font-semibold">
                  {Object.entries(cityViolations).length > 0 
                    ? Object.entries(cityViolations).sort(([,a], [,b]) => b - a)[0][0]
                    : 'Ingen'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
