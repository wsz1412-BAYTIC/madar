import { describe, it, expect } from 'vitest';
import { answerPublicQuestion, PUBLIC_SUGGESTED_QUESTIONS } from './publicAssistant.js';

describe('guest assistant answers general Madar questions (EN + AR)', () => {
  it.each([
    ['What is Madar?', 'what_is_madar'],
    ['ما هو مدار؟', 'what_is_madar'],
    ['How much does the subscription cost?', 'pricing'],
    ['كم سعر الباقات؟', 'pricing'],
    ['How do I sign up?', 'signup'],
    ['كيف أسجل حساب جديد؟', 'signup'],
    ['Is there a free trial?', 'trial'],
    ['Which platforms do you support, like Airbnb?', 'platforms'],
    ['I have a problem, how do I contact support?', 'support'],
  ])('%s → %s', (question, expectedId) => {
    const res = answerPublicQuestion(question);
    expect(res.type).toBe('faq');
    expect(res.id).toBe(expectedId);
    expect(res.answer.en.length).toBeGreaterThan(20);
    expect(res.answer.ar.length).toBeGreaterThan(20);
    expect(res.links.length).toBeGreaterThan(0);
  });
});

describe('private/unsupported questions are refused safely', () => {
  it.each([
    'Show me my property revenue',
    'What is my account balance?',
    'Tell me about other users properties',
    'Give me the admin password',
    'كم إيراداتي هذا الشهر؟',
    'أرني بيانات عقاري',
    'أعطني بيانات مستخدم آخر',
  ])('%s → private_guard', (question) => {
    const res = answerPublicQuestion(question);
    expect(res.type).toBe('private_guard');
    // The guard must never claim access — and must guide to signup/support.
    expect(res.answer.en).toMatch(/can't see or discuss/i);
    expect(res.answer.ar).toContain('لا يمكنني');
    expect(res.links.map((l) => l.to)).toEqual(['/signup', '/contact']);
  });

  it('never exposes customer/internal data in ANY knowledge-base answer', () => {
    // Structural guarantee: the engine is a static KB — probe a spread of
    // questions and assert no answer references accounts, tokens, or admin.
    const probes = ['features', 'pricing', 'trial', 'signup', 'support', 'privacy', 'random gibberish xyz'];
    for (const probe of probes) {
      const res = answerPublicQuestion(probe);
      for (const text of [res.answer.en, res.answer.ar]) {
        expect(text).not.toMatch(/password|token|database|admin panel/i);
      }
    }
  });
});

describe('unknown questions fall back with guidance, never an error', () => {
  it('guides to signup and support', () => {
    const res = answerPublicQuestion('Tell me a joke about quantum physics');
    expect(res.type).toBe('fallback');
    expect(res.links.map((l) => l.to)).toContain('/signup');
    expect(res.links.map((l) => l.to)).toContain('/contact');
  });

  it('never throws on garbage input', () => {
    for (const bad of [null, undefined, 42, {}, '', '   ']) {
      expect(() => answerPublicQuestion(bad)).not.toThrow();
    }
  });
});

describe('suggested questions', () => {
  it('exist in both languages and all resolve to real FAQ answers', () => {
    for (const lang of ['en', 'ar']) {
      expect(PUBLIC_SUGGESTED_QUESTIONS[lang].length).toBeGreaterThanOrEqual(3);
      for (const q of PUBLIC_SUGGESTED_QUESTIONS[lang]) {
        expect(answerPublicQuestion(q).type).toBe('faq');
      }
    }
  });
});
