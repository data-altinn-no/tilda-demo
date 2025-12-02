import React from 'react';
import { Building2, MapPin, Calendar, DollarSign, Landmark, AlertTriangle, Home } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';

/**
 * Properties Tab Component - Displays property information
 */
export function PropertiesTab({ propertyData, selectedAuthority, onClearSelection }) {
  if (!propertyData || propertyData.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingen eiendommer registrert</h3>
          <p className="text-gray-500">Denne organisasjonen har ingen registrerte eiendommer.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Ikke oppgitt';
    return amount.toLocaleString('no-NO') + ' NOK';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ikke oppgitt';
    return new Date(dateString).toLocaleDateString('no-NO');
  };

  const formatArea = (area) => {
    if (area === null || area === undefined) return 'Ikke oppgitt';
    return area.toLocaleString('no-NO') + ' m²';
  };

  const getTotalTeigArea = (teigarealer) => {
    if (!teigarealer || teigarealer.length === 0) return 0;
    return teigarealer.reduce((sum, area) => sum + area, 0);
  };

  const culturalHeritageProperties = propertyData.filter(property => property.harKulturminne);
  const totalProperties = propertyData.length;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Eiendommer ({totalProperties})
            {culturalHeritageProperties.length > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 ml-2">
                {culturalHeritageProperties.length} kulturminne
              </Badge>
            )}
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
          Oversikt over registrerte eiendommer med grunnboksinformasjon og pantedokumenter
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {propertyData.map((property, index) => {
            const totalTeigArea = getTotalTeigArea(property.grunnboksinformasjon?.teigarealer);
            const totalMortgageAmount = property.pantedokumenter?.reduce((sum, doc) => {
              return sum + (doc.beloep?.[0]?.grunnboksinformasjon || 0);
            }, 0) || 0;
            
            return (
              <div 
                key={index} 
                className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                  property.harKulturminne 
                    ? 'border-amber-300 bg-amber-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Property Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      property.harKulturminne ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <Home className={`w-6 h-6 ${property.harKulturminne ? 'text-amber-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {property.grunnboksinformasjon?.kommune || 'Ukjent kommune'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Gnr: {property.grunnboksinformasjon?.gaardsnummer} • 
                        Bnr: {property.grunnboksinformasjon?.bruksnummer}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="border bg-blue-100 text-blue-800 border-blue-200">
                      Eierandel: {property.rettighetshavereTilEiendomsrett?.eierandel || 'Ukjent andel'}
                    </Badge>
                    {property.harKulturminne && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <Landmark className="w-3 h-3 mr-1" />
                        Kulturminne
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Property Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 block text-sm">Bygningsareal</span>
                    <span className="font-medium">{formatArea(property.grunnboksinformasjon?.bygningsareal)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Totalt teigareal</span>
                    <span className="font-medium">{formatArea(totalTeigArea)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Vederlag</span>
                    <span className="font-medium">{property.rettighetshavereTilEiendomsrett?.vederlag || 'Ikke oppgitt'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Hjemmelsdato</span>
                    <span className="font-medium">{formatDate(property.rettighetshavereTilEiendomsrett?.datoHjemmelEiendomsrett)}</span>
                  </div>
                </div>

                {/* Teig Areas */}
                {property.grunnboksinformasjon?.teigarealer && property.grunnboksinformasjon.teigarealer.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-500 block text-sm mb-2">Teigarealer</span>
                    <div className="flex flex-wrap gap-2">
                      {property.grunnboksinformasjon.teigarealer.map((area, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800 border-green-200">
                          {formatArea(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mortgage Documents */}
                {property.pantedokumenter && property.pantedokumenter.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        Pantedokumenter ({property.pantedokumenter.length})
                      </span>
                      <span className="text-sm text-gray-500">
                        Total: {formatCurrency(totalMortgageAmount)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {property.pantedokumenter.map((doc, docIdx) => (
                        <div key={docIdx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{doc.pantehaver}</span>
                              {doc.beloep?.[0]?.beloeptekst && (
                                <p className="text-sm text-gray-600 mt-1">{doc.beloep[0].beloeptekst}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(doc.beloep?.[0]?.grunnboksinformasjon)}
                              </span>
                              <p className="text-sm text-gray-500">
                                {doc.beloep?.[0]?.valuta || 'NOK'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
