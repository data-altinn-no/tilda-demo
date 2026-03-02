import { X, Info, AlertTriangle, Database, Search, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Info Modal - Displays information about the application on first visit
 */
export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Velkommen til Tilda Demo</h2>
                  <p className="text-blue-100 mt-1">Tilsynsdata og risikovurdering</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hva er dette?</h3>
              <p className="text-gray-600 leading-relaxed">
                Dette er en demonstrasjonsapplikasjon som viser hvordan tilsynsdata fra ulike 
                norske myndigheter kan samles og presenteres på én side. Applikasjonen gir 
                en helhetlig oversikt over en organisasjons forhold til tilsynsmyndigheter.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Funksjoner</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Søk på organisasjon</h4>
                    <p className="text-sm text-gray-600">Søk med organisasjonsnummer for å hente data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Samlet dataoversikt</h4>
                    <p className="text-sm text-gray-600">Se tilsyn, økonomi, kjøretøy og eiendom</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Risikovurdering</h4>
                    <p className="text-sm text-gray-600">Automatisk vurdering av compliance-risiko</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Mulighetsrom</h4>
                    <p className="text-sm text-gray-600">Utvidet data med kjøretøy, eiendom og roller</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Viktig informasjon</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Dette er kun en demonstrasjon. All data som vises er <strong>tilfeldig generert</strong> og 
                    representerer ikke virkelige organisasjoner, tilsynsrapporter eller økonomiske forhold. 
                    Dataene skal ikke brukes til reelle vurderinger eller beslutninger.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <Button onClick={onClose} className="px-8">
                Kom i gang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
