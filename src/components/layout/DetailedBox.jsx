import React, { useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';
import { groupByMyndighet } from '../../data/aggregators.js';

/**
 * DetailedBox Component for displaying grouped supervision data
 */
export function DetailedBox({ title, rows, selectedAuthority, onClearSelection }) {
  const grouped = useMemo(() => groupByMyndighet(rows), [rows]);
  const entries = Object.entries(grouped).sort((a, b) => (b[1]).length - (a[1]).length);
  
  // Filter to show only selected authority if filtering is active
  const filteredEntries = selectedAuthority 
    ? entries.filter(([mynd]) => mynd === selectedAuthority)
    : entries.sort((a, b) => (b[1]).length - (a[1]).length);
  
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5"/>
            {title}
          </div>
          {selectedAuthority && (
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Filtrert: {selectedAuthority}</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearSelection}
                className="text-xs px-2 py-1"
              >
                Fjern filter
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {filteredEntries.length === 0 && (
          selectedAuthority ? (
            <div className="text-center py-8">
              <ListChecks className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Ingen data for {selectedAuthority}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ingen treff.</p>
          )
        )}
        {filteredEntries.map(([mynd, items]) => {
          const isSelected = mynd === selectedAuthority;
          return (
            <div 
              key={mynd} 
              className={`rounded-xl border p-3 ${
                isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`font-medium truncate ${
                  isSelected ? 'text-blue-700' : ''
                }`} title={mynd}>
                  {mynd}
                  {isSelected && <span className="ml-2 text-xs">(Valgt)</span>}
                </div>
                <Badge variant={isSelected ? "default" : "secondary"}>{items.length}</Badge>
              </div>
            <ul className="text-sm grid gap-1">
              {items.slice(0,5).map((r, idx) => {
                const isRap = typeof r?.dato === 'string';
                return (
                  <li key={idx} className="flex items-start justify-between gap-3">
                    <div className="flex-1 truncate">
                      {isRap ? (
                        <span>
                          <span className="font-medium">{r.dato}</span>
                          {r.tema && <> · {r.tema}</>}
                          {r.reaksjonstype && <> · {r.reaksjonstype}</>}
                          {r.funn_alvorlighetsgrad && <> · {r.funn_alvorlighetsgrad}</>}
                          {r.tilsynsadresse && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">{r.tilsynsadresse}</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span>
                          <span className="font-medium">{r.startdato}</span>
                          {r.sluttdato && <>→{r.sluttdato}</>}
                          {r.tilsynstema && <> · {r.tilsynstema}</>}
                          {r.tilsynsaktivitet && <> · {r.tilsynsaktivitet}</>}
                          {typeof r.varighet_timer === 'number' && <> · {r.varighet_timer}t</>}
                          {r.kontrolladresse && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">{r.kontrolladresse}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}