import React from 'react';
import { Info, Circle, HelpCircle } from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { aggregateBrudd } from '../../data/aggregators.js';

/**
 * Tooltip component for displaying help text on hover
 */
function InfoTooltip({ text }) {
  return (
    <div className="relative inline-block ml-1 group">
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center z-10">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}

/**
 * General Info Tab Component - Displays organization details and overview statistics
 */
export function GeneralInfoTab({ 
  orgDetails, 
  generatedFor, 
  bruddCount, 
  getStatusColor, 
  rap, 
  koord, 
  perMynd, 
  onAuthorityClick 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Generell informasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Organization Details */}
        {orgDetails && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Organisasjonsnummer</div>
              <div className="text-lg font-semibold">{generatedFor}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Navn</div>
              <div className="text-lg font-semibold">{orgDetails.name}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Organisasjonsform</div>
              <div className="text-lg font-semibold">{orgDetails.organisationForm}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Adresse</div>
              <div className="text-lg font-semibold">{orgDetails.address}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Poststed</div>
              <div className="text-lg font-semibold">{orgDetails.zipcode} {orgDetails.city}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Næringskode</div>
              <div className="text-lg font-semibold">{orgDetails.naceCodeName}</div>
              <div className="text-xs text-gray-600 mt-1">{orgDetails.naceCode}</div>
            </div>
          </div>
        )}
        
        {/* Statistics Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Brudd
              <InfoTooltip text="Antall registrerte avvik eller regelbrudd fra tilsyn. Inkluderer alle funn med alvorlighetsgrad eller reaksjonstype." />
            </div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>{bruddCount}</div>
            <div className="text-sm text-gray-600 mt-1">
              Status: {bruddCount === 0 ? 'Perfect' : bruddCount <= 10 ? 'Warning' : 'Critical'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Antall tilsynsrapporter
              <InfoTooltip text="Totalt antall gjennomførte tilsyn og kontroller registrert for denne organisasjonen fra alle tilsynsmyndigheter." />
            </div>
            <div className="text-xl font-semibold">{rap.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 flex items-center">
              Fremtidige tilsyn
              <InfoTooltip text="Planlagte og koordinerte tilsyn som er registrert for fremtiden. Viser kommende tilsynsaktiviteter fra ulike myndigheter." />
            </div>
            <div className="text-xl font-semibold">{koord.length}</div>
          </div>
        </div>
        
        {/* Authorities Involved */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Tilsynsmyndigheter med treff ({Object.keys(perMynd).length})</div>
          <ul className="text-sm space-y-1">
            {Object.keys(perMynd).map((authority) => {
              const authorityBrudd = perMynd[authority].reduce((sum, item) => sum + item.brudd, 0);
              const getAuthorityColor = () => {
                if (authorityBrudd === 0) return "text-green-500";
                if (authorityBrudd <= 5) return "text-yellow-500";
                return "text-red-500";
              };
              
              return (
                <li key={authority} className="flex items-center gap-2">
                  <Circle className={`w-1.5 h-1.5 fill-current ${getAuthorityColor()}`} />
                  <button 
                    onClick={() => onAuthorityClick(authority)}
                    className="truncate text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                  >
                    {authority} ({authorityBrudd})
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Overall Trend Chart */}
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-3">Trend - alle myndigheter</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={aggregateBrudd(rap)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="brudd" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">Brudd per måned </div>
        </div>
      </CardContent>
    </Card>
  );
}