import React from 'react';
import { Car, Info, Calendar, Gauge, Fuel, Settings, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';

/**
 * Vehicles Tab Component - Displays vehicle information
 */
export function VehiclesTab({ vehicleData, selectedAuthority, onClearSelection }) {
  if (!vehicleData || vehicleData.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-12 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingen kjøretøy registrert</h3>
          <p className="text-gray-500">Denne organisasjonen har ingen registrerte kjøretøy.</p>
        </CardContent>
      </Card>
    );
  }

  const getFuelTypeColor = (fuelType) => {
    switch (fuelType) {
      case 'Elektrisk': return 'bg-green-100 text-green-800 border-green-200';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Diesel': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bensin': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hydrogen': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOwnershipColor = (isOwner) => {
    return isOwner 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ikke oppgitt';
    return new Date(dateString).toLocaleDateString('no-NO');
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'Ikke oppgitt';
    return num.toLocaleString('no-NO');
  };

  const isEUControlOverdue = (nextControlDate) => {
    if (!nextControlDate) return false;
    return new Date(nextControlDate) < new Date();
  };

  const overdueVehicles = vehicleData.filter(vehicle => isEUControlOverdue(vehicle.nesteEUKontroll));
  const totalVehicles = vehicleData.length;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Kjøretøy ({totalVehicles})
            {overdueVehicles.length > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200 ml-2">
                {overdueVehicles.length} forfalt EU-kontroll
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
          Oversikt over registrerte kjøretøy med viktigste informasjon
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicleData.map((vehicle) => {
            const isOverdue = isEUControlOverdue(vehicle.nesteEUKontroll);
            return (
              <div 
                key={vehicle.id} 
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  isOverdue 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isOverdue ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Car className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {vehicle.kjennemerke}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.kjoretoymerke} • {vehicle.kjoretoygruppe}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border ${getFuelTypeColor(vehicle.drivstoff)}`}>
                      {vehicle.drivstoff}
                    </Badge>
                    <Badge className={`border ${getOwnershipColor(vehicle.eier)}`}>
                      {vehicle.eier ? 'Eier' : 'Leaser'}
                    </Badge>
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Forfalt EU-kontroll
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Kilometerstand</span>
                    <span className="font-medium">{formatNumber(vehicle.kilometerstand)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Første reg.</span>
                    <span className="font-medium">{formatDate(vehicle.forstegangsregistrert)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sist EU-kontroll</span>
                    <span className="font-medium">{formatDate(vehicle.sistEugodkjent)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Neste EU-kontroll</span>
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatDate(vehicle.nesteEUKontroll)}
                      {isOverdue && (
                        <Clock className="w-3 h-3 inline ml-1" />
                      )}
                    </span>
                  </div>
                </div>

                {(vehicle.co2utslipp || vehicle.miljoklasse || vehicle.egenvekt || vehicle.tillattTotalvekt) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
                    {vehicle.egenvekt && (
                      <span>Egenvekt: {formatNumber(vehicle.egenvekt)} kg</span>
                    )}
                    {vehicle.tillattTotalvekt && (
                      <span>Tillatt totalvekt: {formatNumber(vehicle.tillattTotalvekt)} kg</span>
                    )}
                    {vehicle.miljoklasse && (
                      <span>Miljøklasse: {vehicle.miljoklasse}</span>
                    )}
                    {vehicle.co2utslipp > 0 && (
                      <span>CO2: {vehicle.co2utslipp} g/km</span>
                    )}
                    {vehicle.girkassetype && (
                      <span>Girkasse: {vehicle.girkassetype}</span>
                    )}
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
