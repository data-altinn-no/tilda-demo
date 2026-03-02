/**
 * Export utility functions for CSV and JSON downloads
 */

import { BruddAggregation } from '../types';

// Convert value to display string
function toDisplayString(v: any): string {
  if (v === null || v === undefined) return "";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

// Escape CSV value
function escCSV(v: any): string {
  const s = toDisplayString(v);
  return `"${s.replace(/"/g, '""')}"`;
}

// Convert array of objects to CSV string
function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const headerSet = new Set<string>();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);
  const headerLine = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => escCSV(r ? r[h] : "")).join(","))
    .join("\r\n"); // CRLF
  return `${headerLine}${rows.length ? "\r\n" : ""}${body}`;
}

// Download data as CSV file
export function downloadCSV(rows: any[], filename: string): void {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Download data as JSON file
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

interface FlattenedBrudd {
  myndighet: string;
  periode?: string;
  tema?: string;
  brudd: number;
  total?: number;
}

// Flatten brudd by myndighet for export
export function flattenBruddByMyndighet(map: Record<string, BruddAggregation[]>): FlattenedBrudd[] {
  const out: FlattenedBrudd[] = [];
  Object.entries(map).forEach(([mynd, rows]) => {
    (rows || []).forEach((r) => out.push({ 
      myndighet: mynd, 
      tema: r.tema,
      brudd: r.brudd,
      total: r.total
    }));
  });
  return out;
}
