import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MiniLineChart } from '../charts/MiniLineChart';

interface TrendsTabProps {
  perMynd: Record<string, Array<{ periode: string; brudd: number }>>;
  selectedAuthority: string | null;
  onClearSelection: () => void;
}

/**
 * Trends Tab Component - Displays trend charts
 */
export function TrendsTab({ perMynd, selectedAuthority, onClearSelection }: TrendsTabProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5" />
              Trender
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
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedAuthority ? (
              perMynd[selectedAuthority] ? (
                <MiniLineChart 
                  key={selectedAuthority} 
                  title={`${selectedAuthority} – brudd per måned`} 
                  data={perMynd[selectedAuthority]} 
                />
              ) : (
                <div className="col-span-full text-center py-8">
                  <LineChartIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Ingen data for {selectedAuthority}</p>
                </div>
              )
            ) : (
              Object.entries(perMynd).map(([mynd, data]) => (
                <MiniLineChart key={mynd} title={`${mynd} – brudd per måned`} data={data} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
