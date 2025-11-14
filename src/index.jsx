import React, { useMemo, useState } from "react";
import { Info, Database, LineChart as LineChartIcon, Building2, RefreshCcw, Download, ListChecks, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Simple component replacements
const Card = ({ children, className = "", ...props }) => <div className={`border rounded-lg shadow-sm bg-white p-4 ${className}`} {...props}>{children}</div>;
const CardHeader = ({ children, className = "", ...props }) => <div className={`mb-4 ${className}`} {...props}>{children}</div>;
const CardTitle = ({ children, className = "", ...props }) => <h3 className={`text-lg font-semibold ${className}`} {...props}>{children}</h3>;
const CardContent = ({ children, className = "", ...props }) => <div className={`${className}`} {...props}>{children}</div>;
const Button = ({ children, className = "", variant = "default", onClick, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium inline-flex items-center gap-2 ${
      variant === "outline" ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"
    } ${className}`} 
    onClick={onClick} 
    {...props}
  >
    {children}
  </button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
);
const Badge = ({ children, className = "", variant = "default", ...props }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === "secondary" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
  } ${className}`} {...props}>
    {children}
  </span>
);

/******************************
 * EXPORT HELPERS (CSV/JSON)
 ******************************/
function toDisplayString(v) {
  if (v === null || v === undefined) return "";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}
function escCSV(v) {
  const s = toDisplayString(v);
  return `"${s.replace(/"/g, '""')}"`;
}
function toCSV(rows) {
  if (!rows || rows.length === 0) return "";
  const headerSet = new Set();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);
  const headerLine = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => escCSV(r ? r[h] : "")).join(","))
    .join("\r\n"); // CRLF
  return `${headerLine}${rows.length ? "\r\n" : ""}${body}`;
}
function downloadCSV(rows, filename) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function downloadJSON(data, filename){
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function flattenBruddByMyndighet(map) {
  const out = [];
  Object.entries(map).forEach(([mynd, rows])=>{
    (rows || []).forEach((r)=> out.push({ myndighet: mynd, periode: r.periode, brudd: r.brudd }));
  });
  return out;
}

/******************************
 * RNG + DOMAINS
 ******************************/
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return n.toString().padStart(2, "0"); }

const MYNDIGHETER = ["Miljødirektoratet", "Arbeidstilsynet", "Mattilsynet", "DSB", "Sjøfartsdirektoratet", "NSM", "Konkurransetilsynet", "UU-tilsynet", "Justervesenet"];
const TEMAER = ["Utslipp", "HMS", "Kjemikalier", "Brannvern", "Hygiene", "Avfall", "Støy", "Vannkvalitet", "Stillassikring"];
const REAKSJONER = ["Pålegg", "Stans", "Gebyr", "Veiledning", "Ingen", "Smekk på fingrene"]; // 'Ingen' = ikke brudd

/******************************
 * DATE HELPERS
 ******************************/
function randomDateISOYearAround() {
  const now = new Date();
  const t = new Date(now.getTime() - Math.random() * 31536000000 + Math.random() * 31536000000);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}
function randomFutureDateISO(monthsAheadMin = 1, monthsAheadMax = 9) {
  const now = new Date();
  const months = randInt(monthsAheadMin, monthsAheadMax);
  const d = new Date(now);
  d.setMonth(d.getMonth() + months);
  d.setDate(randInt(1, 28));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/******************************
 * DUMMY DATA GENERATORS
 ******************************/
function genTilsynskoordineringFor(orgnr) {
  const n = randInt(1, 15);
  return Array.from({ length: n }).map(() => {
    const start = randomFutureDateISO(1, 9);
    const startD = new Date(start);
    const endD = new Date(startD);
    endD.setDate(startD.getDate() + randInt(0, 10));
    const slutt = Math.random() > 0.5 ? `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}` : undefined;
    return {
      tilsynsmyndighet: rand(MYNDIGHETER),
      organisasjonsnummer: orgnr,
      tilsynstema: rand(TEMAER),
      startdato: start,
      sluttdato: slutt,
      kontrolladresse: `Gate ${randInt(1, 99)}, ${randInt(1000, 9999)} Oslo`,
      tilsynsaktivitet: Math.random() > 0.5 ? "Tilsyn" : "Kampanje",
      varighet_timer: randInt(1, 8),
    };
  });
}
function genTilsynsrapportFor(orgnr) {
  const n = randInt(1, 15);
  return Array.from({ length: n }).map(() => ({
    tilsynsmyndighet: rand(MYNDIGHETER),
    organisasjonsnummer: orgnr,
    dato: randomDateISOYearAround(),
    funn_alvorlighetsgrad: rand(["Ingen", "Lav", "Medium", "Høy"]),
    reaksjonstype: rand(REAKSJONER),
    tema: rand(TEMAER),
  }));
}

/******************************
 * AGGREGATION (BRUDD)
 ******************************/
function isBrudd(r) {
  const hasReaksjon = r?.reaksjonstype && r.reaksjonstype !== "Ingen";
  const hasAlvor = r?.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== "Ingen";
  return Boolean(hasReaksjon || hasAlvor);
}
function aggregateBrudd(rapporter) {
  const byKey = {};
  for (const r of rapporter) {
    const key = (r?.dato || "").slice(0, 7) || "ukjent";
    byKey[key] = (byKey[key] || 0) + (isBrudd(r) ? 1 : 0);
  }
  return Object.entries(byKey)
    .map(([periode, brudd]) => ({ periode, brudd }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}
function aggregateBruddByMyndighet(rapporter) {
  const groups = {};
  for (const r of rapporter) {
    const m = r?.tilsynsmyndighet || "Ukjent";
    if (!groups[m]) groups[m] = [];
    groups[m].push(r);
  }
  const out = {};
  for (const m of Object.keys(groups)) {
    out[m] = aggregateBrudd(groups[m]);
  }
  return out;
}

/******************************
 * LISTING HELPERS + PREVIEW BOXES
 ******************************/
function groupByMyndighet(rows) {
  const res = {};
  for (const r of rows) {
    const m = r?.tilsynsmyndighet || "Ukjent";
    if (!res[m]) res[m] = [];
    res[m].push(r);
  }
  return res;
}
function DetailedBox({ title, rows }){
  const grouped = useMemo(()=> groupByMyndighet(rows), [rows]);
  const entries = Object.entries(grouped).sort((a,b)=> (b[1]).length - (a[1]).length);
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5"/>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">Ingen treff.</p>}
        {entries.map(([mynd, items])=> (
          <div key={mynd} className="rounded-xl border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium truncate" title={mynd}>{mynd}</div>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <ul className="text-sm grid gap-1">
              {items.slice(0,5).map((r, idx)=>{
                const isRap = typeof r?.dato === 'string';
                return (
                  <li key={idx} className="flex items-start justify-between gap-3">
                    <div className="flex-1 truncate">
                      {isRap ? (
                        <span>
                          <span className="font-medium">{r.dato}</span>
                          {r.tema && <> · {r.tema}</>}
                          {r.reaksjonstype && <> · {r.reaksjonstype}</>}
                          {r.funn_alvorlighetsgrad && <> · {r.funn_alvorlighetsgrad}</>}
                        </span>
                      ) : (
                        <span>
                          <span className="font-medium">{r.startdato}</span>
                          {r.sluttdato && <>→{r.sluttdato}</>}
                          {r.tilsynstema && <> · {r.tilsynstema}</>}
                          {r.tilsynsaktivitet && <> · {r.tilsynsaktivitet}</>}
                          {typeof r.varighet_timer === 'number' && <> · {r.varighet_timer}t</>}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/******************************
 * CHARTS – LINE (BRUDD PER MÅNED)
 ******************************/
function MiniLineChart({ title, data }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><LineChartIcon className="w-4 h-4" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="brudd" stroke="#2563eb" strokeWidth={2} dot={false} />
          </ReLineChart>
        </ResponsiveContainer>
        <div className="text-xs text-muted-foreground mt-2 text-center">x: måned (YYYY-MM) · y: brudd</div>
      </CardContent>
    </Card>
  );
}

/******************************
 * MAIN – Grafer + utlisting + statusikon (seed skjult til første oppslag)
 ******************************/
export default function TildaLookup() {
  const [orgnr, setOrgnr] = useState("");
  const [koord, setKoord] = useState([]);
  const [rap, setRap] = useState([]);
  const [generatedFor, setGeneratedFor] = useState("");
  const [bruddCount, setBruddCount] = useState(0);
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 9 characters
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 9);
    setOrgnr(cleaned);
  };

  const isValidOrgnr = orgnr.length === 9;

  const handleLookup = () => {
    if (!isValidOrgnr || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call with 1-2 second delay
    const delay = Math.random() * 1000 + 1000; // 1-2 seconds
    
    setTimeout(() => {
      const newRap = genTilsynsrapportFor(orgnr);
      const newKoord = genTilsynskoordineringFor(orgnr);
      setRap(newRap);
      setKoord(newKoord);
      setGeneratedFor(orgnr);
      const totalBrudd = newRap.filter(isBrudd).length;
      setBruddCount(totalBrudd);
      setHasLookedUp(true);
      setIsLoading(false);
    }, delay);
  };

  const getStatusColor = () => {
    if (bruddCount <= 3) return "text-green-500"; // OK
    if (bruddCount <= 7) return "text-yellow-500"; // Warning
    return "text-red-500"; // Critical
  };

  const hasData = hasLookedUp && (rap.length > 0 || koord.length > 0);
  const perMynd = useMemo(()=> aggregateBruddByMyndighet(rap), [rap]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Oppslag – grafer og utlisting</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Skriv orgnr for å generere dummydata. Data og grafer vises først etter første oppslag.</p>
        </div>
        <Button variant="outline" onClick={() => { setRap([]); setKoord([]); setGeneratedFor(""); setBruddCount(0); setHasLookedUp(false); }}>
          <RefreshCcw className="w-4 h-4 mr-2" />Nullstill
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-3 items-center">
          <Input 
            className={`md:w-64 ${!isValidOrgnr && orgnr.length > 0 ? 'border-red-300 focus:ring-red-500' : ''}`}
            value={orgnr} 
            onChange={handleInputChange} 
            placeholder="Skriv orgnr (9 siffer)"
            maxLength={9}
          />
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleLookup} 
              disabled={!isValidOrgnr || isLoading}
              className={(!isValidOrgnr || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Henter data...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />Slå opp
                </>
              )}
            </Button>
            {hasLookedUp && (<Circle className={`w-5 h-5 ${getStatusColor()}`} fill="currentColor" />)}
          </div>
          {hasLookedUp && generatedFor && (<Badge variant="secondary">Generert for {generatedFor}</Badge>)}
        </CardContent>
      </Card>

      {hasData ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Venstre: detaljer per myndighet */}
          <div className="md:col-span-2 grid gap-6">
            <DetailedBox title="Tilsynsrapport – per myndighet (detaljer)" rows={rap} />
            <DetailedBox title="Tilsynskoordinering – per myndighet (detaljer)" rows={koord} />
          </div>
          {/* Høyre: grafer + eksport */}
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Trender</CardTitle></CardHeader>
              <CardContent>
                <MiniLineChart title="Alle myndigheter – brudd per måned" data={aggregateBrudd(rap)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Trender per tilsynsmyndighet</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(perMynd).map(([mynd, data])=> (
                    <MiniLineChart key={mynd} title={`${mynd} – brudd per måned`} data={data} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle><span className="inline-flex items-center gap-2"><Database className="w-5 h-5"/>Eksporter</span></CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                <div className="font-medium">JSON</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" onClick={()=> downloadJSON(aggregateBrudd(rap), `brudd_alle_myndigheter_${generatedFor||'data'}.json`)}><Download className="w-4 h-4 mr-1"/>Alle myndigheter</Button>
                  <Button variant="default" onClick={()=> downloadJSON(aggregateBruddByMyndighet(rap), `brudd_per_myndighet_${generatedFor||'data'}.json`)}><Download className="w-4 h-4 mr-1"/>Per myndighet</Button>
                </div>
                <div className="font-medium mt-3">CSV (CRLF)</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={()=> downloadCSV(aggregateBrudd(rap), `brudd_alle_myndigheter_${generatedFor||'data'}.csv`)}><Download className="w-4 h-4 mr-1"/>Alle myndigheter</Button>
                  <Button variant="outline" onClick={()=> downloadCSV(flattenBruddByMyndighet(perMynd), `brudd_per_myndighet_${generatedFor||'data'}.csv`)}><Download className="w-4 h-4 mr-1"/>Per myndighet</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5" />Ingen data</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Skriv et orgnr og trykk «Slå opp» for å se genererte data.</CardContent>
        </Card>
      )}
    </motion.div>
  );
}
