import React from 'react';
import { Download, FileText, Database, Car, Building2, Users, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';
import { downloadCSV, downloadJSON, flattenBruddByMyndighet } from '../../utils/exportHelpers.js';

/**
 * Download Tab Component - Provides data export functionality
 */
export function DownloadTab({ rap, koord, perMynd, vehicleData, propertyData, roleData, meldinger, financialData, mulighetsrom, selectedAuthority, onClearSelection }) {
  const filteredRap = selectedAuthority ? rap.filter(r => r.tilsynsmyndighet === selectedAuthority) : rap;
  const filteredKoord = selectedAuthority ? koord.filter(k => k.tilsynsmyndighet === selectedAuthority) : koord;
  const filteredPerMynd = selectedAuthority ? { [selectedAuthority]: perMynd[selectedAuthority] || [] } : perMynd;
  const filteredMeldinger = selectedAuthority ? meldinger.filter(m => m.mottaker === selectedAuthority) : meldinger;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Eksporter data
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
        <p className="text-sm text-gray-600 mt-2">
          Last ned data i forskjellige formater for videre analyse
          {selectedAuthority && ` - kun data fra ${selectedAuthority}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Tilsynsrapporter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">Tilsynsrapporter</h3>
              <span className="text-sm text-gray-500">({filteredRap.length} rapporter)</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => downloadCSV(filteredRap, `tilsynsrapport${selectedAuthority ? `-${selectedAuthority}` : ''}.csv`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadJSON(filteredRap, `tilsynsrapport${selectedAuthority ? `-${selectedAuthority}` : ''}.json`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som JSON
              </Button>
            </div>
          </div>

          {/* Tilsynskoordinering */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-gray-900">Tilsynskoordinering</h3>
              <span className="text-sm text-gray-500">({filteredKoord.length} koordineringer)</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => downloadCSV(filteredKoord, `tilsynskoordinering${selectedAuthority ? `-${selectedAuthority}` : ''}.csv`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadJSON(filteredKoord, `tilsynskoordinering${selectedAuthority ? `-${selectedAuthority}` : ''}.json`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som JSON
              </Button>
            </div>
          </div>

          {/* Brudd per myndighet */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <h3 className="font-medium text-gray-900">Brudd per myndighet</h3>
              <span className="text-sm text-gray-500">({Object.keys(filteredPerMynd).length} myndigheter)</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => downloadCSV(flattenBruddByMyndighet(filteredPerMynd), `brudd-per-myndighet${selectedAuthority ? `-${selectedAuthority}` : ''}.csv`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadJSON(flattenBruddByMyndighet(filteredPerMynd), `brudd-per-myndighet${selectedAuthority ? `-${selectedAuthority}` : ''}.json`)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned som JSON
              </Button>
            </div>
          </div>

          {/* Eiendommer */}
          {mulighetsrom && propertyData && propertyData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-medium text-gray-900">Eiendommer</h3>
                <span className="text-sm text-gray-500">({propertyData.length} eiendommer)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => downloadCSV(propertyData, 'eiendommer.csv')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadJSON(propertyData, 'eiendommer.json')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som JSON
                </Button>
              </div>
            </div>
          )}

          {/* Kjøretøy */}
          {mulighetsrom && vehicleData && vehicleData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-gray-900">Kjøretøy</h3>
                <span className="text-sm text-gray-500">({vehicleData.length} kjøretøy)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => downloadCSV(vehicleData, 'kjoretoy.csv')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadJSON(vehicleData, 'kjoretoy.json')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som JSON
                </Button>
              </div>
            </div>
          )}

          {/* Roller */}
          {mulighetsrom && roleData && roleData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <h3 className="font-medium text-gray-900">Roller</h3>
                <span className="text-sm text-gray-500">({roleData.length} roller)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => downloadCSV(roleData, 'roller.csv')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadJSON(roleData, 'roller.json')}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som JSON
                </Button>
              </div>
            </div>
          )}

          {/* Meldinger */}
          {meldinger && meldinger.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-600" />
                <h3 className="font-medium text-gray-900">Meldinger</h3>
                <span className="text-sm text-gray-500">({filteredMeldinger.length} meldinger)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => downloadCSV(filteredMeldinger, `meldinger${selectedAuthority ? `-${selectedAuthority}` : ''}.csv`)}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadJSON(filteredMeldinger, `meldinger${selectedAuthority ? `-${selectedAuthority}` : ''}.json`)}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Last ned som JSON
                </Button>
              </div>
            </div>
          )}

          {/* Summary info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sammendrag</h4>
            <div className={`grid gap-4 text-sm ${mulighetsrom ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 md:grid-cols-4'}`}>
              <div>
                <div className="text-gray-600">Totalt rapporter</div>
                <div className="font-semibold">{filteredRap.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Totalt koordineringer</div>
                <div className="font-semibold">{filteredKoord.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Myndigheter</div>
                <div className="font-semibold">{Object.keys(filteredPerMynd).length}</div>
              </div>
              <div>
                <div className="text-gray-600">Meldinger</div>
                <div className="font-semibold">{filteredMeldinger ? filteredMeldinger.length : 0}</div>
              </div>
              {mulighetsrom && (
                <>
                  <div>
                    <div className="text-gray-600">Eiendommer</div>
                    <div className="font-semibold">{propertyData ? propertyData.length : 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Kjøretøy</div>
                    <div className="font-semibold">{vehicleData ? vehicleData.length : 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Roller</div>
                    <div className="font-semibold">{roleData ? roleData.length : 0}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}