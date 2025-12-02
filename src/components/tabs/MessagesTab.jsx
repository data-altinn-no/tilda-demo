import React from 'react';
import { Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';

/**
 * Messages Tab Component - Displays messages from other authorities
 */
export function MessagesTab({ meldinger, selectedAuthority, onClearSelection }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Meldinger fra andre myndigheter ({selectedAuthority 
              ? meldinger.filter(m => m.mottaker === selectedAuthority).length 
              : meldinger.length})
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
      <CardContent className="grid gap-4">
      {meldinger.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Mail className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Ingen meldinger tilgjengelig</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(selectedAuthority ? meldinger.filter(m => m.mottaker === selectedAuthority) : meldinger).map((melding) => {
            const meldingDate = new Date(melding.datoForMeldingTilAnnenMyndighet);
            const formatDate = (date) => {
              return date.toLocaleDateString('no-NO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            };
            const getMeldingTypeColor = (type) => {
              switch(type) {
                case 'varsel-om-rapport': return 'bg-blue-100 text-blue-800';
                case 'forespørsel-om-informasjon': return 'bg-yellow-100 text-yellow-800';
                case 'koordinering-av-tilsyn': return 'bg-green-100 text-green-800';
                case 'oppfølging-av-funn': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };
            return (
              <Card key={melding.identifikator} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{melding.identifikator}</div>
                        <div className="text-xs text-gray-500">{formatDate(meldingDate)}</div>
                      </div>
                    </div>
                    <Badge className={getMeldingTypeColor(melding.meldingsinnholdTilAnnenMyndighet.meldingsType)}>
                      {melding.meldingsinnholdTilAnnenMyndighet.meldingsType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Avsender</span>
                      <span className="font-medium text-gray-900">{melding.mottaker}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Tilda-enhet</span>
                      <span className="font-medium text-gray-900">{melding.meldingOmTildaenhet}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border-l-4 border-gray-200 text-gray-700 text-sm leading-relaxed italic">
                    "{melding.meldingsinnholdTilAnnenMyndighet.fritekst}"
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </CardContent>
    </Card>
  );
}