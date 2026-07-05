/**
 * Client-side report export utilities — generates downloadable CSV / JSON files.
 * Used by the admin Reports tab to export financial & investment data.
 */

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Convert an array of flat-ish objects into CSV.
 * Columns derived from the keys of the first object (union of all keys).
 */
export function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return "";
  const cols = columns || [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const header = cols.map(escapeCSV).join(",");
  const body = rows
    .map((r) => cols.map((c) => escapeCSV(r[c])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCSV(filename, rows, columns) {
  const csv = toCSV(rows, columns);
  download(`${filename}.csv`, csv, "text/csv;charset=utf-8;");
}

export function downloadJSON(filename, data) {
  download(`${filename}.json`, JSON.stringify(data, null, 2), "application/json");
}

/**
 * Generate a printable HTML report and open the print dialog.
 * title: report heading, sections: [{ heading, rows, columns }]
 */
export function printReport(title, sections) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const sectionHTML = sections
    .map((s) => {
      const cols = s.columns || [...new Set((s.rows || []).flatMap((r) => Object.keys(r)))];
      const thead = cols.map((c) => `<th>${escapeCSV(c)}</th>`).join("");
      const tbody = (s.rows || [])
        .map((r) => `<tr>${cols.map((c) => `<td>${escapeCSV(r[c])}</td>`).join("")}</tr>`)
        .join("");
      return `
        <h2>${escapeCSV(s.heading)}</h2>
        <p class="meta">${(s.rows || []).length} rows</p>
        <table>
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      `;
    })
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
      <meta charset="utf-8" />
      <title>${escapeCSV(title)}</title>
      <style>
        * { font-family: 'Inter', Arial, sans-serif; }
        body { padding: 40px; color: #1a1a1a; }
        h1 { font-size: 22px; font-weight: 300; margin-bottom: 4px; }
        .generated { color: #888; font-size: 11px; margin-bottom: 32px; }
        h2 { font-size: 15px; font-weight: 500; margin-top: 32px; margin-bottom: 4px; }
        .meta { color: #aaa; font-size: 10px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
        th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #ddd; font-weight: 500; color: #555; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
        td { padding: 6px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #fafafa; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>${escapeCSV(title)}</h1>
      <p class="generated">Generated: ${new Date().toLocaleString()}</p>
      ${sectionHTML}
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
}