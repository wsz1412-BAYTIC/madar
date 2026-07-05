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
  ['src/lib/trialManagement.js', 'base44/functions/manage-subscription/trialManagement.js'],
  ['src/lib/madarReport.js', 'base44/functions/manage-subscription/madarReport.js'],
  ['src/lib/aiUsagePolicy.js', 'base44/functions/ai-assistant/aiUsagePolicy.js'],
  ['src/lib/trialManagement.js', 'base44/functions/ai-assistant/trialManagement.js'],
  ['src/lib/notificationScheduler.js', 'base44/functions/telegram-alerts/notificationScheduler.js'],
  ['src/lib/trialManagement.js', 'base44/functions/telegram-alerts/trialManagement.js'],
  ['src/lib/telegramNotifications.js', 'base44/functions/telegram-alerts/telegramNotifications.js'],
  ['src/lib/listingImport.js', 'base44/functions/import-listing/listingImport.js'],
  ['src/lib/platformFees.js', 'base44/functions/generate-price-recommendation/platformFees.js'],
  ['src/lib/platformFees.js', 'base44/functions/first-report/platformFees.js'],
  ['src/lib/platformFees.js', 'base44/functions/ai-investment-consultant/platformFees.js'],
  ['src/lib/firstReport.js', 'base44/functions/first-report/firstReport.js'],
  ['src/lib/madarReport.js', 'base44/functions/first-report/madarReport.js'],
  ['src/lib/investmentAnalysis.js', 'base44/functions/ai-investment-consultant/investmentAnalysis.js'],
  ['src/lib/trialManagement.js', 'base44/functions/ai-investment-consultant/trialManagement.js'],
  ['src/lib/marketHeatmap.js', 'base44/functions/market-heatmap/marketHeatmap.js'],
  ['src/lib/trialManagement.js', 'base44/functions/market-heatmap/trialManagement.js'],
];

describe('backend function mirrors stay in sync with canonical src/lib modules', () => {
  it.each(pairs)('%s matches %s', (canonicalPath, mirrorPath) => {
    const canonical = readFileSync(path.join(root, canonicalPath), 'utf8');
    const mirror = readFileSync(path.join(root, mirrorPath), 'utf8');
    expect(mirror).toBe(canonical);
  });
});
