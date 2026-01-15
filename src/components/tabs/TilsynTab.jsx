import React, { useState, useMemo } from 'react';
import { ClipboardCheck, LineChart as LineChartIcon, Calendar, CheckCircle2, ListChecks, Bell, BellOff, User, FileText, Clock, CheckCircle, AlertTriangle, HelpCircle, ArrowUpDown, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';
import { MiniLineChart } from '../charts';
import { groupByMyndighet } from '../../data/aggregators';

/**
 * Tilsyn Tab Component - Shows tilsyn as individual cards with sorting
 */
export function TilsynTab({ 
  rap, 
  koord, 
  perMynd, 
  selectedAuthorities = [], 
  onClearSelection 
}) {
  const [subTab, setSubTab] = useState('utfort'); // 'utfort', 'planlagt', 'trender'
  const [sortField, setSortField] = useState('dato'); // 'dato' or 'myndighet'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest/Z first, 'asc' = oldest/A first
  const [showOnlyBrudd, setShowOnlyBrudd] = useState(false); // Filter to show only tilsyn with brudd

  // Sort and filter utførte tilsyn
  const sortedRap = useMemo(() => {
    let filtered = selectedAuthorities.length > 0
      ? rap.filter(r => selectedAuthorities.includes(r.tilsynsmyndighet))
      : rap;
    
    // Filter by brudd if enabled
    if (showOnlyBrudd) {
      filtered = filtered.filter(r => r.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== 'Ingen');
    }
    
    return [...filtered].sort((a, b) => {
      if (sortField === 'dato') {
        const dateA = a.dato || '';
        const dateB = b.dato || '';
        return sortOrder === 'desc' 
          ? dateB.localeCompare(dateA) 
          : dateA.localeCompare(dateB);
      } else {
        const myndA = a.tilsynsmyndighet || '';
        const myndB = b.tilsynsmyndighet || '';
        return sortOrder === 'asc' 
          ? myndA.localeCompare(myndB) 
          : myndB.localeCompare(myndA);
      }
    });
  }, [rap, selectedAuthorities, sortField, sortOrder, showOnlyBrudd]);

  // Sort and filter planlagte tilsyn
  const sortedKoord = useMemo(() => {
    let filtered = selectedAuthorities.length > 0
      ? koord.filter(k => selectedAuthorities.includes(k.tilsynsmyndighet))
      : koord;
    
    return [...filtered].sort((a, b) => {
      if (sortField === 'dato') {
        const dateA = a.startdato || '';
        const dateB = b.startdato || '';
        return sortOrder === 'desc' 
          ? dateB.localeCompare(dateA) 
          : dateA.localeCompare(dateB);
      } else {
        const myndA = a.tilsynsmyndighet || '';
        const myndB = b.tilsynsmyndighet || '';
        return sortOrder === 'asc' 
          ? myndA.localeCompare(myndB) 
          : myndB.localeCompare(myndA);
      }
    });
  }, [koord, selectedAuthorities, sortField, sortOrder]);

  // Group reports by authority for trends
  const rapByMynd = useMemo(() => groupByMyndighet(rap), [rap]);
  const koordByMynd = useMemo(() => groupByMyndighet(koord), [koord]);

  return (
    <div className="grid gap-6">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-neutral-200">
          <button
            onClick={() => setSubTab('utfort')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subTab === 'utfort'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Utførte tilsyn ({sortedRap.length})
          </button>
          <button
            onClick={() => setSubTab('planlagt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subTab === 'planlagt'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            Planlagte tilsyn ({sortedKoord.length})
          </button>
          <button
            onClick={() => setSubTab('trender')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subTab === 'trender'
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <LineChartIcon className="w-4 h-4" aria-hidden="true" />
            Trender
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort and filter controls */}
          {subTab === 'utfort' && (
            <>
              {/* Brudd filter toggle */}
              <button
                onClick={() => setShowOnlyBrudd(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                  showOnlyBrudd 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
                aria-pressed={showOnlyBrudd}
                aria-label="Vis kun tilsyn med brudd"
              >
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                Kun brudd
              </button>
              {/* Sort field selector */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
                aria-label="Velg sorteringsfelt"
              >
                <option value="dato">Sorter etter dato</option>
                <option value="myndighet">Sorter etter myndighet</option>
              </select>
              {/* Sort order button */}
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
                aria-label={`Sorteringsrekkefølge: ${sortOrder === 'desc' ? 'synkende' : 'stigende'}`}
              >
                <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                {sortField === 'dato' 
                  ? (sortOrder === 'desc' ? 'Nyeste først' : 'Eldste først')
                  : (sortOrder === 'asc' ? 'A-Å' : 'Å-A')
                }
              </button>
            </>
          )}
          {subTab === 'planlagt' && (
            <>
              {/* Sort field selector */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
                aria-label="Velg sorteringsfelt"
              >
                <option value="dato">Sorter etter dato</option>
                <option value="myndighet">Sorter etter myndighet</option>
              </select>
              {/* Sort order button */}
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
                aria-label={`Sorteringsrekkefølge: ${sortOrder === 'desc' ? 'synkende' : 'stigende'}`}
              >
                <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                {sortField === 'dato' 
                  ? (sortOrder === 'desc' ? 'Nyeste først' : 'Eldste først')
                  : (sortOrder === 'asc' ? 'A-Å' : 'Å-A')
                }
              </button>
            </>
          )}

          {selectedAuthorities.length > 0 && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Utførte tilsyn as cards */}
      {subTab === 'utfort' && (
        <div className="grid gap-4">
          {sortedRap.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" aria-hidden="true" />
                <p className="text-gray-600">Ingen utførte tilsyn funnet</p>
              </CardContent>
            </Card>
          ) : (
            sortedRap.map((r, idx) => {
              const hasBrudd = r.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== 'Ingen';
              return (
                <Card 
                  key={idx} 
                  className={`rounded-xl border-l-4 ${hasBrudd ? 'border-l-red-500' : 'border-l-green-500'}`}
                >
                  <CardContent className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-semibold text-neutral-900">{r.dato}</span>
                          {hasBrudd && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                              {r.funn?.length || 1} brudd
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                          <span className="font-medium">{r.tilsynsmyndighet}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Uanmeldt badge with tooltip */}
                        <button 
                          type="button"
                          className="relative group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                          aria-describedby={`uanmeldt-tooltip-${idx}`}
                        >
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            r.varpisel === 'Ja' 
                              ? 'bg-orange-100 text-orange-700' 
                              : r.varpisel === 'Nei'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {r.varpisel === 'Ja' ? <BellOff className="w-3 h-3" aria-hidden="true" /> : <Bell className="w-3 h-3" aria-hidden="true" />}
                            Uanmeldt: {r.varpisel || 'Ikke angitt'}
                            <HelpCircle className="w-3 h-3 ml-0.5 text-gray-400" aria-hidden="true" />
                          </span>
                          <div 
                            id={`uanmeldt-tooltip-${idx}`}
                            role="tooltip"
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 whitespace-nowrap z-10"
                          >
                            Var tilsynsobjektet varslet på forhånd
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" aria-hidden="true"></div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-sm space-y-2">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {r.tema && (
                            <div className="flex items-start gap-2">
                              <span className="text-neutral-500 min-w-[80px]">Tema:</span>
                              <span className="text-neutral-700">{r.tema}</span>
                            </div>
                          )}
                          {r.tilsynsadresse && (
                            <div className="flex items-start gap-2">
                              <span className="text-neutral-500 min-w-[80px]">Adresse:</span>
                              <span className="text-neutral-700">{r.tilsynsadresse}</span>
                            </div>
                          )}
                          {r.status && (
                            <div className="flex items-start gap-2">
                              <span className="text-neutral-500 min-w-[80px]">Status:</span>
                              <span className={
                                r.status === 'Gjennomført' 
                                  ? 'text-green-600' 
                                  : 'text-yellow-600'
                              }>
                                {r.status}
                              </span>
                            </div>
                          )}
                          {r.kontaktperson && (
                            <div className="flex items-start gap-2">
                              <span className="text-neutral-500 min-w-[80px]">Kontakt:</span>
                              <span className="text-neutral-700">
                                {r.kontaktperson.navn} · <span className="text-blue-600">{r.kontaktperson.kontaktinfo}</span>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {r.funn && r.funn.length > 0 ? (
                            <>
                              <div className="text-neutral-500 text-xs font-medium mb-1">Funn og reaksjoner:</div>
                              {r.funn.map((f, fIdx) => (
                                <div key={fIdx} className="border-l-2 border-red-200 pl-2 py-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      f.reaksjonstype === 'Pålegg' || f.reaksjonstype === 'Tvangsmulkt' 
                                        ? 'bg-red-100 text-red-700' 
                                        : 'bg-neutral-100 text-neutral-600'
                                    }`}>
                                      {f.reaksjonstype}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      f.alvorlighetsgrad === 'Høy' 
                                        ? 'bg-red-100 text-red-700' 
                                        : f.alvorlighetsgrad === 'Medium'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {f.alvorlighetsgrad}
                                    </span>
                                  </div>
                                  {f.beskrivelse && (
                                    <div className="text-xs text-neutral-600">{f.beskrivelse}</div>
                                  )}
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-500 min-w-[80px]">Reaksjoner:</span>
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">
                                Ingen
                              </span>
                            </div>
                          )}
                          {r.rapportUrl && (
                            <a 
                              href={r.rapportUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline mt-2"
                            >
                              <FileText className="w-4 h-4" aria-hidden="true" />
                              Se tilsynsrapport (PDF)
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Planlagte tilsyn as cards */}
      {subTab === 'planlagt' && (
        <div className="grid gap-4">
          {sortedKoord.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" aria-hidden="true" />
                <p className="text-gray-600">Ingen planlagte tilsyn funnet</p>
              </CardContent>
            </Card>
          ) : (
            sortedKoord.map((k, idx) => (
              <Card key={idx} className="rounded-xl border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-semibold text-neutral-900">{k.startdato}</span>
                        {k.sluttdato && (
                          <span className="text-neutral-500">→ {k.sluttdato}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Building2 className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium">{k.tilsynsmyndighet}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {k.tilsynsaktivitet && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          {k.tilsynsaktivitet}
                        </span>
                      )}
                      {k.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          k.status === 'Fullført' ? 'bg-green-100 text-green-700' :
                          k.status === 'Pågår' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {k.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-sm space-y-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {k.tilsynstema && (
                          <div className="flex items-start gap-2">
                            <span className="text-neutral-500 min-w-[80px]">Tema:</span>
                            <span className="text-neutral-700">{k.tilsynstema}</span>
                          </div>
                        )}
                        {k.kontrolladresse && (
                          <div className="flex items-start gap-2">
                            <span className="text-neutral-500 min-w-[80px]">Adresse:</span>
                            <span className="text-neutral-700">{k.kontrolladresse}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {k.varighet_timer && (
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-neutral-400 mt-0.5" aria-hidden="true" />
                            <span className="text-neutral-700">Estimert varighet: {k.varighet_timer} timer</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Contact person below */}
                    {k.kontaktperson && (
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                          <span className="text-neutral-500">Kontaktpunkt:</span>
                          <span className="text-neutral-700">{k.kontaktperson.navn}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-blue-600">{k.kontaktperson.kontaktinfo}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
