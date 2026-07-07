import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportCSV, exportJSON } from '@/lib/reportExport';

// Minimal, reusable CSV/JSON export controls for admin tables. The CALLER is
// responsible for passing an already-safe `rows` array (projected to the exact
// fields it wants exported) — this component never reaches into raw records, so
// it can't leak a field the page didn't choose to include. `columns` (optional)
// pins the column order; otherwise reportExport derives it from the row keys.
export default function ExportButtons({ baseName, rows, columns, disabled = false }) {
  const empty = !Array.isArray(rows) || rows.length === 0;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || empty}
        onClick={() => exportCSV(baseName, rows, columns)}
        title="تصدير CSV"
      >
        <Download className="ml-1 h-4 w-4" />CSV
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || empty}
        onClick={() => exportJSON(baseName, rows)}
        title="تصدير JSON"
      >
        <Download className="ml-1 h-4 w-4" />JSON
      </Button>
    </div>
  );
}
