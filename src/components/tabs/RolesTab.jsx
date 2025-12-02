import React from 'react';
import { Users, Shield, Crown, User, UserCheck, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../ui';

/**
 * Roles Tab Component - Displays organizational roles and responsibilities
 */
export function RolesTab({ roleData, selectedAuthority, onClearSelection }) {
  if (!roleData || roleData.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingen roller registrert</h3>
          <p className="text-gray-500">Denne organisasjonen har ingen registrerte roller eller ansvarsområder.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Ikke oppgitt';
    return new Date(dateString).toLocaleDateString('no-NO');
  };

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'Daglig leder': return Crown;
      case 'Styreleder': return Shield;
      case 'Styremedlem': return UserCheck;
      case 'Revisor': return User;
      case 'Prokura': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (roleType) => {
    switch (roleType) {
      case 'Daglig leder': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Styreleder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Styremedlem': return 'bg-green-100 text-green-800 border-green-200';
      case 'Revisor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Prokura': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeRoles = roleData.filter(role => role.aktiv);
  const inactiveRoles = roleData.filter(role => !role.aktiv);
  const totalRoles = roleData.length;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Roller ({totalRoles})
            {inactiveRoles.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2">
                {inactiveRoles.length} inaktive
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
          Oversikt over organisasjonens roller, ansvarsområder og nøkkelpersoner
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Roles */}
          {activeRoles.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                Aktive roller ({activeRoles.length})
              </h3>
              <div className="space-y-4">
                {activeRoles.map((role, index) => {
                  const RoleIcon = getRoleIcon(role.rolle);
                  return (
                    <div 
                      key={`active-${index}`} 
                      className="border rounded-lg p-4 transition-all hover:shadow-md border-gray-200 bg-white hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                            <RoleIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              {role.navn}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {role.rolle === 'Revisor' 
                                ? 'Revisorselskap' 
                                : role.fodselsdato 
                                  ? `Født: ${formatDate(role.fodselsdato)}` 
                                  : 'Fødselsdato ikke oppgitt'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`border ${getRoleColor(role.rolle)}`}>
                            {role.rolle}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Aktiv
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Tiltrådt</span>
                          <span className="font-medium">{formatDate(role.fraOgMed)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Gyldig til</span>
                          <span className="font-medium">{formatDate(role.tilOgMed) || 'Ikke oppgitt'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Adresse</span>
                          <span className="font-medium">{role.adresse || 'Ikke oppgitt'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Poststed</span>
                          <span className="font-medium">{role.poststed || 'Ikke oppgitt'}</span>
                        </div>
                      </div>

                      {role.ansvarsomrader && role.ansvarsomrader.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-500 block text-sm mb-2">Ansvarsområder</span>
                          <div className="flex flex-wrap gap-2">
                            {role.ansvarsomrader.map((område, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200">
                                {område}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inactive Roles */}
          {inactiveRoles.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Inaktive roller ({inactiveRoles.length})
              </h3>
              <div className="space-y-4">
                {inactiveRoles.map((role, index) => {
                  const RoleIcon = getRoleIcon(role.rolle);
                  return (
                    <div 
                      key={`inactive-${index}`} 
                      className="border rounded-lg p-4 transition-all border-gray-200 bg-gray-50 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                            <RoleIcon className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-700">
                              {role.navn}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {role.rolle === 'Revisor' 
                                ? 'Revisorselskap' 
                                : role.fodselsdato 
                                  ? `Født: ${formatDate(role.fodselsdato)}` 
                                  : 'Fødselsdato ikke oppgitt'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                            {role.rolle}
                          </Badge>
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Inaktiv
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Tiltrådt</span>
                          <span className="font-medium text-gray-600">{formatDate(role.fraOgMed)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Fratrådt</span>
                          <span className="font-medium text-gray-600">{formatDate(role.tilOgMed) || 'Ikke oppgitt'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Adresse</span>
                          <span className="font-medium text-gray-600">{role.adresse || 'Ikke oppgitt'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Poststed</span>
                          <span className="font-medium text-gray-600">{role.poststed || 'Ikke oppgitt'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
