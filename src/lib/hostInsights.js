// PR L — Host investment/operational insight signals (pure, unit-tested).
//
// Derives ONLY safe, own-data flags from the host's own UserProperty rows to
// decide which guidance to emphasize. It never invents occupancy/ADR/revenue
// numbers, never uses external/official market data, and returns no figures to
// display — just booleans/averages the dashboard cards use to pick wording.

// Below this average own-reported occupancy we surface the "improve occupancy"
// guidance. It's a soft signal from the host's own data, not a market claim.
export const WEAK_OCCUPANCY_THRESHOLD = 55;

/**
 * @param {Array} properties - the host's own UserProperty rows.
 * @returns {{ hasProperties:boolean, hasOccupancyData:boolean,
 *             avgOccupancy:(number|null), weakOccupancy:boolean }}
 */
export function deriveHostSignals(properties = []) {
  const list = Array.isArray(properties) ? properties : [];
  const occ = list
    .map((p) => (p && Number.isFinite(p.currentOccupancy) ? p.currentOccupancy : null))
    .filter((v) => v !== null);
  const hasOccupancyData = occ.length > 0;
  const avgOccupancy = hasOccupancyData
    ? Math.round((occ.reduce((s, v) => s + v, 0) / occ.length) * 10) / 10
    : null;
  return {
    hasProperties: list.length > 0,
    hasOccupancyData,
    avgOccupancy,
    // Only "weak" when we actually have data AND it's below the threshold —
    // absence of data is never treated as weak (no false negatives shown).
    weakOccupancy: avgOccupancy !== null && avgOccupancy < WEAK_OCCUPANCY_THRESHOLD,
  };
}
