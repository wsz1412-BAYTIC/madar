import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SUBSCRIBER_TEASER_FIELDS, sanitizeTeaserOpportunity } from './realEstateOpportunities';

describe('sanitizeTeaserOpportunity', () => {
  it('returns exactly the subscriber-safe teaser fields', () => {
    const result = sanitizeTeaserOpportunity({
      id: 'opp_1',
      public_teaser_title: 'فرصة عامة',
      city: 'Riyadh',
      required_capital_range_public: '1M–2M SAR',
      expected_return_range_public: '8%–12%',
      expected_holding_period: '3 سنوات',
      opportunity_type: 'residential',
      confidence_label_public: 'high',
      growth_catalyst_type: 'infrastructure',
      teaser_image_public: 'https://example.com/image.jpg',
      district_internal: 'secret district',
      location_internal: 'secret location',
      asking_price_exact: 123,
      fair_value_range_internal: 'secret value',
      listing_url_internal: 'https://secret.example',
      broker_or_owner_contact_internal: 'secret contact',
      ai_audit_notes: 'secret audit notes',
    });

    expect(Object.keys(result).sort()).toEqual([...SUBSCRIBER_TEASER_FIELDS].sort());
    expect(result).not.toHaveProperty('district_internal');
    expect(result).not.toHaveProperty('location_internal');
    expect(result).not.toHaveProperty('asking_price_exact');
    expect(result).not.toHaveProperty('listing_url_internal');
    expect(result).not.toHaveProperty('broker_or_owner_contact_internal');
    expect(result).not.toHaveProperty('ai_audit_notes');
  });

  it('keeps the frontend and backend teaser allow-lists in sync', () => {
    const functionSource = readFileSync(
      path.resolve(process.cwd(), 'base44/functions/real-estate-opportunities/entry.ts'),
      'utf8'
    );
    const match = functionSource.match(/const TEASER_FIELDS = \[([\s\S]*?)\];/);
    expect(match).toBeTruthy();

    const backendFields = [...match[1].matchAll(/"([^"]+)"/g)].map((fieldMatch) => fieldMatch[1]);
    expect(backendFields.sort()).toEqual([...SUBSCRIBER_TEASER_FIELDS].sort());
  });

});