import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, BarChart3, AlertTriangle, TrendingUp, Shield, Scale } from "lucide-react";
import { Footer } from "../components/layout";

/**
 * Economic Data Page - Describes the algorithm used in EconomicAssessment
 */
export function EconomicDataPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full animate-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8"
        >
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>

          {/* Header */}
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Økonomisk vurderingsalgoritme</h1>
                <p className="text-neutral-600">Dokumentasjon av algoritmen for økonomisk helhetsvurdering</p>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="digdir-card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Oversikt</h2>
            <p className="text-neutral-700 mb-3">
              Den økonomiske vurderingsalgoritmen analyserer en virksomhets finansielle helsetilstand basert på offentlig tilgjengelige regnskapstall. 
              Algoritmen produserer en samlet score fra 0–100, en risikokategori, og identifiserer spesifikke risiko- og positivfaktorer.
            </p>
            <p className="text-neutral-600 text-sm">
              Vurderingen baserer seg på tre års regnskapsdata og kombinerer ni nøkkelindikatorer med en vektet totalvurdering,
              supplert med Altman Z-score, røde flagg-regler og bransjesammenligning.
            </p>
          </div>

          {/* Rating Scale */}
          <div className="digdir-card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-600" />
              Vurderingsskala
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Nivå</th>
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Score</th>
                    <th className="text-left py-2 font-semibold text-neutral-600">Beskrivelse</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Utmerket</span></td>
                    <td className="py-2 pr-4 font-mono">80–100</td>
                    <td className="py-2 text-neutral-600">Solid finansiell helsetilstand. Ingen tiltak nødvendig.</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">God</span></td>
                    <td className="py-2 pr-4 font-mono">60–79</td>
                    <td className="py-2 text-neutral-600">God økonomisk situasjon. Normal tilsynsfrekvens.</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Akseptabel</span></td>
                    <td className="py-2 pr-4 font-mono">40–59</td>
                    <td className="py-2 text-neutral-600">Akseptabel, men noen enkeltområder kan være svake.</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">Svak</span></td>
                    <td className="py-2 pr-4 font-mono">20–39</td>
                    <td className="py-2 text-neutral-600">Svak økonomi. Anbefaler økt oppmerksomhet.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">Kritisk</span></td>
                    <td className="py-2 pr-4 font-mono">0–19</td>
                    <td className="py-2 text-neutral-600">Kritisk svak økonomi. Skjerpet tilsynsfrekvens anbefales.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Indicators */}
          <div className="digdir-card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Nøkkelindikatorer (vektet)
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              Totalscoren beregnes som et vektet gjennomsnitt av ni indikatorer. Hver indikator scores 0–100 basert på etablerte normer for norske virksomheter.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">#</th>
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Indikator</th>
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Vekt</th>
                    <th className="text-left py-2 font-semibold text-neutral-600">Formel</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1, name: "Resultatgrad", weight: "18%", formula: "(Ordinært resultat + Rentekostnader) / Driftsinntekter × 100" },
                    { n: 2, name: "Egenkapitalandel", weight: "16%", formula: "Egenkapital / Totalkapital × 100" },
                    { n: 3, name: "Likviditetsgrad 1", weight: "12%", formula: "Omløpsmidler / Kortsiktig gjeld" },
                    { n: 4, name: "Likviditetsgrad 2", weight: "10%", formula: "(Omløpsmidler − Varelager) / Kortsiktig gjeld" },
                    { n: 5, name: "Totalrentabilitet", weight: "12%", formula: "(Resultat + Rentekostnader) / Totalkapital × 100" },
                    { n: 6, name: "Gjeldsgrad", weight: "10%", formula: "Gjeld / Egenkapital" },
                    { n: 7, name: "Omsetningsvekst", weight: "10%", formula: "(Inntekter siste − Inntekter forrige) / Inntekter forrige × 100" },
                    { n: 8, name: "Ansatteutvikling", weight: "7%", formula: "(Ansatte siste − Ansatte forrige) / Ansatte forrige × 100" },
                    { n: 9, name: "Driftsstatus", weight: "5%", formula: "Kategorisk (normal, under avvikling, konkurs)" },
                  ].map((ind) => (
                    <tr key={ind.n} className="border-b border-neutral-100">
                      <td className="py-2 pr-4 text-neutral-400">{ind.n}</td>
                      <td className="py-2 pr-4 font-medium text-neutral-900">{ind.name}</td>
                      <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-mono">{ind.weight}</span></td>
                      <td className="py-2 font-mono text-xs text-neutral-600">{ind.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scoring Logic */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Indicator scoring */}
            <div className="digdir-card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Scoring av enkeltindikatorer</h2>
              <p className="text-neutral-600 text-sm mb-3">
                Hver indikator mappes til en score 0–100 basert på bransjestandarder:
              </p>
              <div className="space-y-3 text-sm">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="font-medium text-neutral-800 mb-1">Resultatgrad</p>
                  <ul className="text-neutral-600 space-y-0.5 text-xs">
                    <li>≥ 10%: Meget god (80–100)</li>
                    <li>5–10%: God (60–80)</li>
                    <li>1–5%: Tilfredsstillende (40–60)</li>
                    <li>0–1%: Svak (20–40)</li>
                    <li>&lt; 0%: Ikke tilfredsstillende (0–20)</li>
                  </ul>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="font-medium text-neutral-800 mb-1">Egenkapitalandel</p>
                  <ul className="text-neutral-600 space-y-0.5 text-xs">
                    <li>≥ 40%: Meget god (80–100)</li>
                    <li>20–40%: God (60–80)</li>
                    <li>10–20%: Tilfredsstillende (40–60)</li>
                    <li>0–10%: Svak (20–40)</li>
                    <li>&lt; 0%: Ikke tilfredsstillende (0–20)</li>
                  </ul>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="font-medium text-neutral-800 mb-1">Likviditetsgrad 1</p>
                  <ul className="text-neutral-600 space-y-0.5 text-xs">
                    <li>≥ 2.0: Meget god (80–100)</li>
                    <li>1.5–2.0: God (60–80)</li>
                    <li>1.0–1.5: Tilfredsstillende (40–60)</li>
                    <li>0.5–1.0: Svak (20–40)</li>
                    <li>&lt; 0.5: Ikke tilfredsstillende (0–20)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Red Flags */}
            <div className="digdir-card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Røde flagg-regler
              </h2>
              <p className="text-neutral-600 text-sm mb-3">
                Kritiske røde flagg overstyrer totalscoren til maks 25/100, uavhengig av de vektede indikatorene.
                Dette sikrer at alvorlig finansiell nød alltid fanges opp.
              </p>
              <div className="space-y-2">
                {[
                  { rule: "Negativ egenkapital", desc: "Egenkapital < 0 i siste regnskapsår — teknisk insolvens", severity: "kritisk" },
                  { rule: "Underskudd tre år", desc: "Negativt årsresultat tre sammenhengende år", severity: "kritisk" },
                  { rule: "Omsetningskollaps", desc: "Omsetning falt > 50% siste år", severity: "kritisk" },
                  { rule: "Kritisk Z-score", desc: "Altman Z-score under 1.1 (høy konkursrisiko)", severity: "kritisk" },
                  { rule: "Under avvikling", desc: "Virksomheten er under avvikling eller konkurs", severity: "kritisk" },
                  { rule: "Svært lav likviditet", desc: "Likviditetsgrad 1 under 0.5", severity: "alvorlig" },
                ].map((flag) => (
                  <div key={flag.rule} className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-100">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      flag.severity === 'kritisk' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                    }`}>
                      {flag.severity}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-red-900">{flag.rule}</p>
                      <p className="text-xs text-red-700">{flag.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Altman Z-Score */}
          <div className="digdir-card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Altman Z-score (modifisert for private selskaper)
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              Altman Z-score er en etablert konkursmodell som kombinerer fem finansielle forholdstall til en enkelt score.
              Modellen er tilpasset private norske selskaper (erstatter markedsverdi med bokført egenkapital).
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 mb-4 font-mono text-sm">
              <p className="text-neutral-800 font-semibold mb-2">Z = 0.717×X1 + 0.847×X2 + 3.107×X3 + 0.420×X4 + 0.998×X5</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-600">
                <div><strong>X1</strong> = Arbeidskapital / Totalkapital</div>
                <div><strong>X2</strong> = Opptjent egenkapital / Totalkapital</div>
                <div><strong>X3</strong> = EBIT / Totalkapital</div>
                <div><strong>X4</strong> = Bokført egenkapital / Total gjeld</div>
                <div><strong>X5</strong> = Omsetning / Totalkapital</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-bold text-green-800">Z &gt; 2.9</p>
                <p className="text-xs text-green-700">Trygg sone</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-bold text-yellow-800">1.23 – 2.9</p>
                <p className="text-xs text-yellow-700">Gråsone</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-bold text-red-800">Z &lt; 1.23</p>
                <p className="text-xs text-red-700">Faresone</p>
              </div>
            </div>
          </div>

          {/* Industry Comparison */}
          <div className="digdir-card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Bransjesammenligning
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              Algoritmen genererer bransjenormer basert på NACE-kode og sammenligner selskapets nøkkeltall med disse.
              Selskaper som avviker mer enn 2.5 standardavvik fra bransjesnittet flagges som «mistenkelige» — enten
              fordi de gjør det unormalt godt (mulig kreativ regnskapsføring) eller unormalt dårlig (mulig underrapportering).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Nøkkeltall</th>
                    <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Mistenkelig høy</th>
                    <th className="text-left py-2 font-semibold text-neutral-600">Mistenkelig lav</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Driftsmargin", high: "Kreativ regnskapsføring, feilrapportering", low: "Underrapportering av inntekt" },
                    { metric: "Omsetning per ansatt", high: "Phantom-ansatte, hvitvasking", low: "Svart arbeid, urapportert arbeidskraft" },
                    { metric: "Egenkapitalandel", high: "—", low: "Undercapitalized, insolvent" },
                    { metric: "Lønnskostnad/Omsetning", high: "—", low: "Svart arbeid, ansatte off-the-books" },
                    { metric: "Likviditetsgrad 1", high: "—", low: "Kan ikke betjene kortsiktig gjeld" },
                  ].map((row) => (
                    <tr key={row.metric} className="border-b border-neutral-100">
                      <td className="py-2 pr-4 font-medium text-neutral-900">{row.metric}</td>
                      <td className="py-2 pr-4 text-purple-700 text-xs">{row.high}</td>
                      <td className="py-2 text-purple-700 text-xs">{row.low}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              <p><strong>Terskel:</strong> &gt;2.5σ = Mistenkelig, &gt;1.5σ = Noe avvikende, ≤1.5σ = Normal</p>
              <p><strong>Samlet vurdering:</strong> ≥2 mistenkelige = «Mistenkelig avvik», ≥1 mistenkelig eller ≥3 milde = «Avvikende», ellers «Normal»</p>
            </div>
          </div>

          {/* Data Flow */}
          <div className="digdir-card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Dataflyt og kilder</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Input</h3>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• 3–5 års regnskapsdata (Brønnøysundregistrene)</li>
                  <li>• Enhetsinformasjon (org.form, NACE-kode, kommune)</li>
                  <li>• Driftsstatus fra Enhetsregisteret</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Prosessering</h3>
                <ul className="text-green-800 space-y-1 text-xs">
                  <li>• 9 vektede indikatorer → totalscore</li>
                  <li>• Altman Z-score beregning</li>
                  <li>• Røde flagg-sjekk</li>
                  <li>• Bransjesammenligning (NACE)</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Output</h3>
                <ul className="text-purple-800 space-y-1 text-xs">
                  <li>• Totalscore 0–100 med nivå</li>
                  <li>• Risiko- og positivfaktorer</li>
                  <li>• Z-score med sone</li>
                  <li>• Bransje-avviksrapport</li>
                  <li>• Anbefaling for tilsynsfrekvens</li>
                </ul>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
