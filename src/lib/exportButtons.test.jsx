// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

// Lightweight coverage for the admin ExportButtons wrapper: it delegates to the
// existing reportExport helpers and disables when there are no rows.
const exportCSV = vi.fn();
const exportJSON = vi.fn();
vi.mock('@/lib/reportExport', () => ({ exportCSV: (...a) => exportCSV(...a), exportJSON: (...a) => exportJSON(...a) }));

import ExportButtons from '@/components/admin/ExportButtons';

beforeEach(() => { exportCSV.mockClear(); exportJSON.mockClear(); });
afterEach(() => cleanup());

describe('ExportButtons', () => {
  const rows = [{ a: 1 }, { a: 2 }];

  it('calls exportCSV / exportJSON with the base name and rows', () => {
    render(<ExportButtons baseName="site-updates" rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: /CSV/i }));
    fireEvent.click(screen.getByRole('button', { name: /JSON/i }));
    expect(exportCSV).toHaveBeenCalledWith('site-updates', rows, undefined);
    expect(exportJSON).toHaveBeenCalledWith('site-updates', rows);
  });

  it('disables both buttons when there are no rows (nothing to export)', () => {
    render(<ExportButtons baseName="x" rows={[]} />);
    for (const b of screen.getAllByRole('button')) expect(b.disabled).toBe(true);
  });
});
