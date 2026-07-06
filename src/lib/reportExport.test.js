import { describe, it, expect } from 'vitest';
import {
  escapeCSVValue, toCSV, toJSON, safeFilename,
} from './reportExport.js';

describe('escapeCSVValue', () => {
  it('quotes and doubles quotes for commas / quotes / newlines / CR', () => {
    expect(escapeCSVValue('a,b')).toBe('"a,b"');
    expect(escapeCSVValue('he said "hi"')).toBe('"he said ""hi"""');
    expect(escapeCSVValue('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeCSVValue('line1\r\nline2')).toBe('"line1\r\nline2"');
  });

  it('leaves plain values unquoted', () => {
    expect(escapeCSVValue('plain')).toBe('plain');
    expect(escapeCSVValue(42)).toBe('42');
  });

  it('preserves Arabic text as-is', () => {
    expect(escapeCSVValue('عقار في الرياض')).toBe('عقار في الرياض');
    expect(escapeCSVValue('الرياض, جدة')).toBe('"الرياض, جدة"'); // comma still quotes
  });

  it('renders null / undefined predictably as empty string (never "null")', () => {
    expect(escapeCSVValue(null)).toBe('');
    expect(escapeCSVValue(undefined)).toBe('');
  });

  it('serializes objects to compact JSON (then CSV-quotes the embedded quotes)', () => {
    // JSON contains ", so the cell is quoted and inner quotes doubled.
    expect(escapeCSVValue({ a: 1 })).toBe('"{""a"":1}"');
  });

  it('neutralizes spreadsheet formula injection for string cells only', () => {
    expect(escapeCSVValue('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(escapeCSVValue('+1-800')).toBe("'+1-800");
    expect(escapeCSVValue('@handle')).toBe("'@handle");
    // Genuine negative numbers are NOT altered.
    expect(escapeCSVValue(-5)).toBe('-5');
    expect(escapeCSVValue(-5.5)).toBe('-5.5');
  });
});

describe('toCSV', () => {
  const rows = [
    { city: 'Riyadh', note: 'a,b', revenue: 1000 },
    { city: 'جدة', note: 'quote "x"', revenue: 2000 },
  ];

  it('builds a header + CRLF-separated body from the union of keys', () => {
    const csv = toCSV(rows);
    expect(csv).toBe(
      'city,note,revenue\r\n' +
      'Riyadh,"a,b",1000\r\n' +
      'جدة,"quote ""x""",2000'
    );
  });

  it('honors an explicit column list and order', () => {
    expect(toCSV(rows, ['revenue', 'city'])).toBe('revenue,city\r\n1000,Riyadh\r\n2000,جدة');
  });

  it('fills missing / null / undefined cells with empty string', () => {
    const csv = toCSV([{ a: 1, b: 2 }, { a: 3 }], ['a', 'b', 'c']);
    expect(csv).toBe('a,b,c\r\n1,2,\r\n3,,');
  });

  it('handles empty / invalid input safely', () => {
    expect(toCSV([])).toBe('');
    expect(toCSV(null)).toBe('');
    expect(toCSV(undefined)).toBe('');
  });

  it('does not mutate the input rows or columns array', () => {
    const input = [{ a: 1 }, { b: 2 }];
    const snapshot = JSON.parse(JSON.stringify(input));
    const cols = ['a', 'b'];
    toCSV(input, cols);
    expect(input).toEqual(snapshot);
    expect(cols).toEqual(['a', 'b']);
  });
});

describe('toJSON', () => {
  it('returns valid, parseable JSON that round-trips', () => {
    const data = [{ city: 'الرياض', revenue: 1000, nested: { ok: true } }];
    const json = toJSON(data);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual(data);
  });
});

describe('safeFilename', () => {
  const date = new Date('2026-07-06T10:00:00Z');

  it('sanitizes unsafe path/wildcard characters and appends a date stamp + ext', () => {
    expect(safeFilename('revenue/report:2026*', 'csv', { date })).toBe('revenue_report_2026-2026-07-06.csv');
  });

  it('collapses whitespace and trims separators', () => {
    expect(safeFilename('  my   report  ', 'json', { date })).toBe('my_report-2026-07-06.json');
  });

  it('preserves Arabic base names', () => {
    expect(safeFilename('تقرير الإيرادات', 'csv', { date })).toBe('تقرير_الإيرادات-2026-07-06.csv');
  });

  it('falls back to "report" for empty/blank base and tolerates missing ext', () => {
    expect(safeFilename('', 'csv', { date })).toBe('report-2026-07-06.csv');
    expect(safeFilename('///', 'csv', { date })).toBe('report-2026-07-06.csv');
    expect(safeFilename('data', undefined, { date })).toBe('data-2026-07-06');
  });

  it('falls back to today on an invalid date without throwing', () => {
    expect(() => safeFilename('x', 'csv', { date: new Date('bad') })).not.toThrow();
  });
});
