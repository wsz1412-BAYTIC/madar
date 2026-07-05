import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');

describe('PriceRecommendation entity RLS', () => {
  // This entity file contains no // comments, so it is valid JSON as-is.
  const entity = JSON.parse(read('base44/entities/PriceRecommendation.jsonc'));

  it('blocks delete entirely, and restricts create/update to admin (asServiceRole sets role=admin but does NOT bypass RLS, so plain `false` would also block the backend functions themselves)', () => {
    expect(entity.rls.create).toEqual({ user_condition: { role: 'admin' } });
    expect(entity.rls.update).toEqual({ user_condition: { role: 'admin' } });
    expect(entity.rls.delete).toBe(false);
  });

  it('restricts reads to the owning user or an admin', () => {
    const readRule = entity.rls.read;
    expect(readRule.$or).toBeDefined();
    const clauses = JSON.stringify(readRule);
    expect(clauses).toContain('{{user.id}}');
    expect(clauses).toContain('"role":"admin"');
  });

  it('declares aiModel/recommendedPriceMin/recommendedPriceMax as nullable, since the generator writes null on realistic paths (no API key configured, or missing operatingCosts)', () => {
    expect(entity.properties.aiModel.type).toEqual(['string', 'null']);
    expect(entity.properties.recommendedPriceMin.type).toEqual(['number', 'null']);
    expect(entity.properties.recommendedPriceMax.type).toEqual(['number', 'null']);
  });

  it('declares appliedPriceRangeMin/Max as nullable too, since applyTransition writes null when no recommended range existed at apply time', () => {
    expect(entity.properties.appliedPriceRangeMin.type).toEqual(['number', 'null']);
    expect(entity.properties.appliedPriceRangeMax.type).toEqual(['number', 'null']);
  });
});

describe('OPENAI_API_KEY handling in the backend function', () => {
  const entrySource = read('base44/functions/generate-price-recommendation/entry.ts');

  it('reads the key from Deno.env, never hard-codes it', () => {
    expect(entrySource).toContain('Deno.env.get("OPENAI_API_KEY")');
    expect(entrySource).not.toMatch(/sk-[a-zA-Z0-9]{10,}/);
  });

  it('never logs the key', () => {
    expect(entrySource).not.toMatch(/console\.(log|error|warn|info)\([^)]*apiKey/);
  });

  it('never includes the key in a response payload', () => {
    // every Response.json({...}) block should not reference apiKey
    const responseBlocks = entrySource.match(/Response\.json\(\{[\s\S]*?\}\)/g) || [];
    for (const block of responseBlocks) {
      expect(block).not.toContain('apiKey');
    }
  });
});

describe('.gitignore / .env.example still protect the real secret', () => {
  const gitignore = read('.gitignore');
  const envExample = read('.env.example');

  it('ignores .env, .env.local, .env.production and *.env', () => {
    for (const pattern of ['.env', '.env.local', '.env.production', '*.env']) {
      expect(gitignore).toContain(pattern);
    }
  });

  it('.env.example only ships an empty placeholder', () => {
    expect(envExample).toMatch(/OPENAI_API_KEY=\s*$/m);
  });
});

describe('review-price-recommendation authorization', () => {
  const entrySource = read('base44/functions/review-price-recommendation/entry.ts');

  it('checks the caller is authenticated before touching a recommendation', () => {
    expect(entrySource).toMatch(/base44\.auth\.me\(\)/);
    expect(entrySource).toMatch(/Unauthorized/);
  });

  it('verifies the caller owns the recommendation or is an admin before any mutation', () => {
    expect(entrySource).toMatch(/record\.userId === user\.id/);
    expect(entrySource).toMatch(/Forbidden/);
  });
});

describe('generate-price-recommendation never trusts client-supplied metrics', () => {
  const entrySource = read('base44/functions/generate-price-recommendation/entry.ts');

  it('recomputes the snapshot from the server-fetched property, not from the request body', () => {
    // The fee rate is server-derived too: property.platform + the
    // PLATFORM_FEES_JSON env override — never anything the client sent.
    expect(entrySource).toMatch(/buildMetricsSnapshot\(property, \{ platformFeeRate: fee\.rate \}\)/);
    expect(entrySource).toMatch(/resolvePlatformFee\(property\.platform, feeOverrides\)/);
    expect(entrySource).toMatch(/parseFeeOverrides\(Deno\.env\.get\(PLATFORM_FEES_CONFIG_KEY\)\)/);
    // the only field trusted from the request body is the propertyId used to look the record up
    expect(entrySource).toMatch(/const \{ propertyId \} = body/);
  });
});
