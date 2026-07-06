// PR B — Client-side report export utilities (CSV / JSON).
//
// Migrated (rebuilt) from the madar2 snapshot's reportExport.js. Pure,
// dependency-free string builders (toCSV / toJSON / escapeCSVValue /
// safeFilename) are unit-tested; the thin browser triggers (exportCSV /
// exportJSON) wrap them with a Blob download and are guarded for non-browser
// environments.
//
// Not migrated from the snapshot: printReport() (HTML print-to-PDF path) —
// out of PR B's CSV/JSON scope and adjacent to the deferred PDF work.
//
// Hardening vs. the snapshot:
//   • CSV fields quoted on comma / quote / newline / carriage-return.
//   • RFC-4180 CRLF row separators.
//   • Spreadsheet formula-injection guard for string cells (=, +, -, @, tab,
//     CR at start) — genuine numbers are never altered.
//   • UTF-8 BOM on the CSV download so Excel renders Arabic correctly.

// Characters that are unsafe in filenames across Windows/macOS/Linux, plus
// control chars (U+0000–U+001F). Arabic/Latin letters, digits, and hyphens
// are preserved; whitespace is collapsed to "_" separately.
const UNSAFE_FILENAME = /[/\\:*?"<>|\u0000-\u001f]/g;

// A leading one of these makes a spreadsheet treat a cell as a formula.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

// UTF-8 byte-order mark — prepended to CSV downloads so Excel detects UTF-8
// and renders Arabic text correctly.
const UTF8_BOM = '\uFEFF';

/** YYYY-MM-DD stamp from a Date (falls back to today on invalid input). */
function dateStamp(date) {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Build a safe, date-stamped filename: `<clean-base>-YYYY-MM-DD[.ext]`.
 * Unsafe/path/control characters become "_"; whitespace collapses; leading and
 * trailing separators are trimmed. Arabic base names are preserved.
 */
export function safeFilename(base, ext, { date = new Date() } = {}) {
  const cleanBase =
    String(base ?? '')
      .trim()
      .replace(UNSAFE_FILENAME, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^[._]+|[._]+$/g, '') || 'report';
  const suffix = ext ? `.${String(ext).replace(/^\.+/, '')}` : '';
  return `${cleanBase}-${dateStamp(date)}${suffix}`;
}

/**
 * Escape a single value for a CSV cell.
 *  - null / undefined → "" (predictable, never the string "null").
 *  - objects → compact JSON.
 *  - formula-triggering STRINGS are prefixed with ' (numbers are left intact).
 *  - values containing , " \n \r are wrapped in quotes with "" doubling.
 */
export function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const isRealNumber = typeof value === 'number' && Number.isFinite(value);
  let s = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (!isRealNumber && FORMULA_TRIGGER.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Convert an array of flat objects to a CSV string (no trailing newline).
 * Columns default to the union of keys across all rows (first-seen order).
 * Does NOT mutate the input. Empty/invalid input → "".
 */
export function toCSV(rows, columns) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return '';
  const cols =
    Array.isArray(columns) && columns.length
      ? columns
      : [...new Set(list.flatMap((r) => (r && typeof r === 'object' ? Object.keys(r) : [])))];
  const line = (cells) => cells.map(escapeCSVValue).join(',');
  const header = line(cols);
  const body = list.map((r) => line(cols.map((c) => (r ? r[c] : undefined))));
  return [header, ...body].join('\r\n');
}

/** Pretty-printed JSON string (2-space indent). */
export function toJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Trigger a browser download of `content`. No-op (returns false) outside a
 * browser (SSR / tests) so callers stay safe. Returns true when a download
 * was initiated.
 */
export function triggerDownload(filename, content, mime) {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
    return false;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/** Export rows as a CSV download (UTF-8 BOM for Excel/Arabic). */
export function exportCSV(baseName, rows, columns, opts = {}) {
  const csv = toCSV(rows, columns);
  return triggerDownload(safeFilename(baseName, 'csv', opts), UTF8_BOM + csv, 'text/csv;charset=utf-8;');
}

/** Export any serializable data as a JSON download. */
export function exportJSON(baseName, data, opts = {}) {
  return triggerDownload(safeFilename(baseName, 'json', opts), toJSON(data), 'application/json');
}
