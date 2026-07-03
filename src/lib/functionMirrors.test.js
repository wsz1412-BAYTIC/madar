import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Base44 backend functions only bundle files inside their own folder, so the
// pure calculation/validation/workflow modules are physically duplicated
// into each base44/functions/*/ directory. This test guarantees the deployed
// Deno copies never silently drift from the canonical src/lib versions that
// the rest of the test suite actually exercises.

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

const pairs = [
  ['src/lib/pricingEngine.js', 'base44/functions/generate-price-recommendation/pricingEngine.js'],
  ['src/lib/aiRecommendationValidation.js', 'base44/functions/generate-price-recommendation/aiRecommendationValidation.js'],
  ['src/lib/recommendationWorkflow.js', 'base44/functions/review-price-recommendation/recommendationWorkflow.js'],
  ['src/lib/subscriptionProvisioning.js', 'base44/functions/manage-subscription/subscriptionProvisioning.js'],
  ['src/lib/adminMutations.js', 'base44/functions/admin-operations/adminMutations.js'],
];

describe('backend function mirrors stay in sync with canonical src/lib modules', () => {
  it.each(pairs)('%s matches %s', (canonicalPath, mirrorPath) => {
    const canonical = readFileSync(path.join(root, canonicalPath), 'utf8');
    const mirror = readFileSync(path.join(root, mirrorPath), 'utf8');
    expect(mirror).toBe(canonical);
  });
});
