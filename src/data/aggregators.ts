/**
 * Data aggregation functions for violations and authorities
 */

interface PeriodBrudd {
  periode: string;
  brudd: number;
}

// Check if a report represents a violation
export function isBrudd(r: any): boolean {
  const hasReaksjon = r?.reaksjonstype && r.reaksjonstype !== "Ingen";
  const hasAlvor = r?.funn_alvorlighetsgrad && r.funn_alvorlighetsgrad !== "Ingen";
  return Boolean(hasReaksjon || hasAlvor);
}

// Aggregate violations by time period
export function aggregateBrudd(rapporter: any[]): PeriodBrudd[] {
  const byKey: Record<string, number> = {};
  for (const r of rapporter) {
    const key = (r?.dato || "").slice(0, 7) || "ukjent";
    byKey[key] = (byKey[key] || 0) + (isBrudd(r) ? 1 : 0);
  }
  return Object.entries(byKey)
    .map(([periode, brudd]) => ({ periode, brudd }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}

// Aggregate violations by authority
export function aggregateBruddByMyndighet(rapporter: any[]): Record<string, PeriodBrudd[]> {
  const groups: Record<string, any[]> = {};
  for (const r of rapporter) {
    const m = r?.tilsynsmyndighet || "Ukjent";
    if (!groups[m]) groups[m] = [];
    groups[m].push(r);
  }
  const out: Record<string, PeriodBrudd[]> = {};
  for (const m of Object.keys(groups)) {
    out[m] = aggregateBrudd(groups[m]);
  }
  return out;
}

// Group data by authority
export function groupByMyndighet<T extends { tilsynsmyndighet?: string }>(rows: T[]): Record<string, T[]> {
  const res: Record<string, T[]> = {};
  for (const r of rows) {
    const m = r?.tilsynsmyndighet || "Ukjent";
    if (!res[m]) res[m] = [];
    res[m].push(r);
  }
  return res;
}
