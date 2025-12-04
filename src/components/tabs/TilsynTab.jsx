import React, { useState, useMemo } from 'react';
import { ClipboardCheck, LineChart as LineChartIcon, Calendar, CheckCircle2, ListChecks, Bell, BellOff, User, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';
import { MiniLineChart } from '../charts';
import { groupByMyndighet } from '../../data/aggregators';

/**
 * Tilsyn Tab Component - Combined view of performed and planned supervision per authority
 */
export function TilsynTab({ 
  rap, 
  koord, 
  perMynd, 
  selectedAuthorities = [], 
  onClearSelection 
}) {
  const [subTab, setSubTab] = useState('oversikt'); // 'oversikt', 'trender'
  const [expandedRap, setExpandedRap] = useState({}); // Track expanded utførte tilsyn per authority
  const [expandedKoord, setExpandedKoord] = useState({}); // Track expanded planlagte tilsyn per authority

  // Group reports and coordination by authority
  const rapByMynd = useMemo(() => groupByMyndighet(rap), [rap]);
  const koordByMynd = useMemo(() => groupByMyndighet(koord), [koord]);
  
  // Get all unique authorities
  const allAuthorities = useMemo(() => {
    const authorities = new Set([...Object.keys(rapByMynd), ...Object.keys(koordByMynd)]);
    return Array.from(authorities).sort();
  }, [rapByMynd, koordByMynd]);

  // Filter authorities if any are selected
  const filteredAuthorities = selectedAuthorities.length > 0
    ? allAuthorities.filter(a => selectedAuthorities.includes(a))
    : allAuthorities;

  return (
    <div className="grid gap-6">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-neutral-200">
          <button
            onClick={() => setSubTab('oversikt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subTab === 'oversikt'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Oversikt per myndighet
          </button>
          <button
            onClick={() => setSubTab('trender')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subTab === 'trender'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            Trender
          </button>
        </div>

        {selectedAuthorities.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-50 text-primary-800 border border-primary-100 px-3 py-1">
              Filtrert: {selectedAuthorities.join(', ')}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearSelection}
              className="digdir-button digdir-button-ghost text-xs"
            >
              Fjern filter
            </Button>
          </div>
        )}
      </div>

      {/* Combined overview per authority */}
      {subTab === 'oversikt' && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5"/>
              Tilsyn per myndighet
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {filteredAuthorities.length === 0 && (
              <div className="text-center py-8">
                <ListChecks className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Ingen tilsyn funnet</p>
              </div>
            )}
            {filteredAuthorities.map((mynd) => {
              const rapporter = rapByMynd[mynd] || [];
              const koordineringer = koordByMynd[mynd] || [];
              const isSelected = selectedAuthorities.includes(mynd);
              
              return (
                <div 
                  key={mynd} 
                  className={`rounded-xl border p-4 ${
                    isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-neutral-200'
                  }`}
                >
                  {/* Authority header */}
                  {(() => {
                    const totalBrudd = rapporter.filter(r => r.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== 'Ingen').length;
                    return (
                      <div className="flex items-center justify-between mb-4">
                        <div className={`font-semibold text-lg ${isSelected ? 'text-blue-700' : 'text-neutral-800'}`}>
                          {mynd}
                          {isSelected && <span className="ml-2 text-xs font-normal">(Valgt)</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {rapporter.length} utført
                          </Badge>
                          {totalBrudd > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {totalBrudd} brudd
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Calendar className="w-3 h-3 mr-1" />
                            {koordineringer.length} planlagt
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Utførte tilsyn */}
                    <div className="bg-white rounded-lg p-3 border border-neutral-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Utførte tilsyn
                      </div>
                      {rapporter.length === 0 ? (
                        <p className="text-sm text-neutral-400 italic">Ingen utførte tilsyn</p>
                      ) : (
                        <ul className="text-sm space-y-3">
                          {rapporter.slice(0, expandedRap[mynd] ? undefined : 3).map((r, idx) => {
                            const hasBrudd = r.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== 'Ingen';
                            return (
                            <li key={idx} className={`border-l-2 ${hasBrudd ? 'border-red-300' : 'border-green-200'} pl-3 py-1`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{r.dato}</span>
                                  {hasBrudd && (
                                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                      <AlertTriangle className="w-3 h-3" />
                                      Brudd ({r.funn_alvorlighetsgrad})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {r.varpisel && (
                                    <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                                      r.varpisel === 'Varslet' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                      {r.varpisel === 'Varslet' ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                                      {r.varpisel}
                                    </span>
                                  )}
                                  {r.status && (
                                    <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                                      r.status === 'Gjennomført' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {r.status === 'Gjennomført' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                      {r.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {r.tema && <div className="text-neutral-600 text-xs mb-1">{r.tema}</div>}
                              {r.reaksjonstype && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  r.reaksjonstype === 'Pålegg' || r.reaksjonstype === 'Tvangsmulkt' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {r.reaksjonstype}
                                </span>
                              )}
                              {r.kontaktperson && (
                                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                  <User className="w-3 h-3" />
                                  <span>{r.kontaktperson.navn}</span>
                                  <span className="text-neutral-400">·</span>
                                  <span className="text-blue-600">{r.kontaktperson.kontaktinfo}</span>
                                </div>
                              )}
                              {r.rapportUrl && (
                                <a 
                                  href={r.rapportUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  Se tilsynsrapport (PDF)
                                </a>
                              )}
                            </li>
                          );
                          })}
                          {rapporter.length > 3 && (
                            <li>
                              <button 
                                onClick={() => setExpandedRap(prev => ({ ...prev, [mynd]: !prev[mynd] }))}
                                className="text-primary-600 hover:text-primary-800 text-xs font-medium hover:underline"
                              >
                                {expandedRap[mynd] ? 'Vis færre' : `+ ${rapporter.length - 3} flere`}
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* Planlagte tilsyn */}
                    <div className="bg-white rounded-lg p-3 border border-neutral-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Planlagte tilsyn
                      </div>
                      {koordineringer.length === 0 ? (
                        <p className="text-sm text-neutral-400 italic">Ingen planlagte tilsyn</p>
                      ) : (
                        <ul className="text-sm space-y-2">
                          {koordineringer.slice(0, expandedKoord[mynd] ? undefined : 3).map((k, idx) => (
                            <li key={idx} className="border-l-2 border-blue-200 pl-2">
                              <span className="font-medium">{k.startdato}</span>
                              {k.sluttdato && <span className="text-neutral-500"> → {k.sluttdato}</span>}
                              {k.tilsynstema && <span className="text-neutral-600"> · {k.tilsynstema}</span>}
                              {k.status && (
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                                  k.status === 'Fullført' ? 'bg-green-100 text-green-700' :
                                  k.status === 'Pågår' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {k.status}
                                </span>
                              )}
                            </li>
                          ))}
                          {koordineringer.length > 3 && (
                            <li>
                              <button 
                                onClick={() => setExpandedKoord(prev => ({ ...prev, [mynd]: !prev[mynd] }))}
                                className="text-primary-600 hover:text-primary-800 text-xs font-medium hover:underline"
                              >
                                {expandedKoord[mynd] ? 'Vis færre' : `+ ${koordineringer.length - 3} flere`}
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Trends sub-tab */}
      {subTab === 'trender' && (
        <Card className="digdir-card border-0 shadow-none bg-transparent">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-neutral-500" />
              Trender per tilsynsmyndighet
            </h2>
          </div>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedAuthorities.length > 0 ? (
                // Show only selected authorities
                selectedAuthorities.map(auth => 
                  perMynd[auth] ? (
                    <MiniLineChart 
                      key={auth} 
                      title={`${auth} – brudd per måned`} 
                      data={perMynd[auth]} 
                    />
                  ) : (
                    <div key={auth} className="text-center py-12 text-neutral-400 bg-white border border-neutral-200 rounded-digdir">
                      <LineChartIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Ingen data for {auth}</p>
                    </div>
                  )
                )
              ) : (
                // Show all authorities
                Object.entries(perMynd).map(([mynd, data]) => (
                  <MiniLineChart key={mynd} title={`${mynd} – brudd per måned`} data={data} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
