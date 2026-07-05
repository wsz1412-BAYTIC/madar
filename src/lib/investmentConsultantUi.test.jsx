// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Behavioral coverage for the AI Investment Consultant page: lease analysis
// rendering (verdict, net revenue, risks/actions, disclaimer), the friendly
// upgrade panel on plan-gated 403s (never raw errors), Arabic/RTL labels, and
// the always-present disclaimer.

const base44Mock = vi.hoisted(() => ({
  functions: { invoke: vi.fn() },
  entities: { InvestmentAnalysis: { filter: vi.fn() } },
}));
vi.mock('@/api/base44Client', () => ({ base44: base44Mock }));
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn(), useToast: () => ({ toast: vi.fn() }) }));

let langState;
vi.mock('@/contexts/LanguageContext', () => ({
  useLang: () => langState,
}));

let authState;
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => authState,
}));

// framer-motion's whileInView needs IntersectionObserver (absent in jsdom) —
// swap the Motion wrappers for plain pass-through divs.
vi.mock('@/components/madar/Motion', () => ({
  FadeIn: ({ children, className }) => <div className={className}>{children}</div>,
}));

import InvestmentConsultant from '@/pages/InvestmentConsultant';

const ANALYSIS = {
  analysisType: 'lease',
  verdict: 'renegotiate',
  dealStrength: { score: 62, label: { en: 'Moderate deal', ar: 'صفقة متوسطة' } },
  expectedNetRevenue: { monthly: 9800, annual: 117600, feeRate: 0.13, feeEstimated: true },
  roiEstimate: 18.4,
  rentPriceGap: -7.5,
  negotiationProbability: 64,
  counterOffer: 78000,
  risks: [
    { en: 'Seasonal demand dips in summer', ar: 'انخفاض موسمي في الطلب صيفًا' },
    { en: 'Rent is above the district median', ar: 'الإيجار أعلى من متوسط الحي' },
    { en: 'Operating costs may rise', ar: 'قد ترتفع التكاليف التشغيلية' },
  ],
  actions: [
    { en: 'Counter-offer at 78,000 SAR', ar: 'قدّم عرضًا مضادًا بقيمة 78,000 ر.س' },
    { en: 'Ask for a 2-month grace period', ar: 'اطلب فترة سماح لمدة شهرين' },
    { en: 'Verify licensing costs upfront', ar: 'تحقق من تكاليف الترخيص مسبقًا' },
  ],
  strNarrativeAr: 'هذه الصفقة واعدة لكنها تحتاج إلى تفاوض إضافي قبل المضي قدمًا.',
  disclaimer: {
    en: 'This analysis is advisory only and is not financial advice.',
    ar: 'هذا التحليل استشاري فقط ولا يُعد نصيحة مالية.',
  },
  source: 'ai',
  createdAt: '2026-07-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  langState = { lang: 'en', isRTL: false, t: (k) => k };
  authState = { user: { id: 'u1' } };
  base44Mock.entities.InvestmentAnalysis.filter.mockResolvedValue([]);
});
afterEach(() => cleanup());

function renderPage() {
  return render(
    <MemoryRouter>
      <InvestmentConsultant />
    </MemoryRouter>
  );
}

function fillLeaseForm() {
  fireEvent.click(screen.getByRole('button', { name: 'Riyadh' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
  fireEvent.click(screen.getByRole('button', { name: 'Airbnb' }));
  fireEvent.change(screen.getByLabelText('Annual asking rent (SAR) *'), { target: { value: '80000' } });
  fireEvent.change(screen.getByLabelText('Expected nightly rate (SAR) *'), { target: { value: '450' } });
  fireEvent.change(screen.getByLabelText('Expected occupancy (%) *'), { target: { value: '70' } });
}

const analyzeButton = () => screen.getByRole('button', { name: /Analyze deal|تحليل الصفقة/ });

describe('lease analysis → full result rendering', () => {
  it('renders verdict, net revenue, three risks, three actions and the disclaimer', async () => {
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: { success: true, analysis: ANALYSIS } });
    renderPage();

    fillLeaseForm();
    fireEvent.click(analyzeButton());

    // Verdict banner
    expect(await screen.findByText('Renegotiate the terms')).toBeTruthy();

    // Payload shape sent to the backend function
    expect(base44Mock.functions.invoke).toHaveBeenCalledWith(
      'ai-investment-consultant',
      expect.objectContaining({
        action: 'analyze',
        analysisType: 'lease',
        input: expect.objectContaining({
          city: 'Riyadh',
          unitType: 'apartment',
          platform: 'Airbnb',
          askingRent: 80000,
          expectedNightlyRate: 450,
          expectedOccupancy: 70,
        }),
      })
    );

    // Net revenue tiles (monthly + annual) with the estimate chip
    expect(screen.getByText(/9,800/)).toBeTruthy();
    expect(screen.getByText(/117,600/)).toBeTruthy();
    expect(screen.getByText('estimate')).toBeTruthy();

    // Counter-offer + negotiation probability
    expect(screen.getByText('78,000 SAR')).toBeTruthy();
    expect(screen.getByText('64%')).toBeTruthy();

    // Exactly the three risks and three actions
    for (const risk of ANALYSIS.risks) expect(screen.getByText(risk.en)).toBeTruthy();
    for (const action of ANALYSIS.actions) expect(screen.getByText(action.en)).toBeTruthy();

    // Arabic STR narrative + disclaimer
    expect(screen.getByText(ANALYSIS.strNarrativeAr)).toBeTruthy();
    expect(screen.getByText(ANALYSIS.disclaimer.en)).toBeTruthy();
  });
});

describe('plan-gated 403 → upgrade panel', () => {
  it('renders the friendly upgrade panel with a /billing link and no raw error', async () => {
    const err = new Error('Request failed with status code 403');
    err.response = {
      status: 403,
      data: {
        upgrade: 'business',
        error: 'تحليل صفقات الشراء متاح في باقة الأعمال فقط.',
        error_en: 'Purchase deal analysis is available on the Business plan.',
      },
    };
    base44Mock.functions.invoke.mockRejectedValueOnce(err);
    renderPage();

    // Switch to the Business-gated purchase analysis and submit.
    fireEvent.click(screen.getByRole('button', { name: /Purchase/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Riyadh' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
    fireEvent.click(screen.getByRole('button', { name: 'Airbnb' }));
    fireEvent.change(screen.getByLabelText('Asking price (SAR) *'), { target: { value: '850000' } });
    fireEvent.change(screen.getByLabelText('Expected nightly rate (SAR) *'), { target: { value: '450' } });
    fireEvent.change(screen.getByLabelText('Expected occupancy (%) *'), { target: { value: '65' } });
    fireEvent.click(analyzeButton());

    // Upgrade panel with the server's bilingual copy (English shown in en mode)
    expect(await screen.findByText('Purchase deal analysis is available on the Business plan.')).toBeTruthy();
    expect(screen.getByText('This feature requires a plan upgrade')).toBeTruthy();

    const upgradeLink = screen.getByRole('link', { name: /Upgrade plan/ });
    expect(upgradeLink.getAttribute('href')).toBe('/billing');

    // The raw exception text NEVER surfaces.
    expect(screen.queryByText(/Request failed/i)).toBeNull();
    expect(screen.queryByText(/403/)).toBeNull();
  });

  it('any other failure shows the generic bilingual message, not the exception', async () => {
    base44Mock.functions.invoke.mockRejectedValueOnce(new Error('Network Error'));
    renderPage();

    fillLeaseForm();
    fireEvent.click(analyzeButton());

    expect(await screen.findByText(/We could not analyze this deal right now/)).toBeTruthy();
    expect(screen.queryByText(/Network Error/i)).toBeNull();
  });
});

describe('Arabic / RTL', () => {
  it('renders Arabic headings, labels and LTR numeric inputs', async () => {
    langState = { lang: 'ar', isRTL: true, t: (k) => k };
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: { success: true, analysis: ANALYSIS } });
    renderPage();

    // Arabic heading + subtitle
    expect(screen.getByRole('heading', { name: /المستشار الاستثماري الذكي/ })).toBeTruthy();
    expect(screen.getByText(/لا يُعد نصيحة مالية/)).toBeTruthy();

    // Numeric input reads LTR even in RTL mode
    const rentInput = screen.getByLabelText('الإيجار السنوي المطلوب (ر.س) *');
    expect(rentInput.getAttribute('dir')).toBe('ltr');

    // Submit in Arabic and get Arabic verdict + disclaimer
    fireEvent.click(screen.getByRole('button', { name: 'الرياض' }));
    fireEvent.click(screen.getByRole('button', { name: 'شقة' }));
    fireEvent.click(screen.getByRole('button', { name: 'إير بي إن بي' }));
    fireEvent.change(rentInput, { target: { value: '80000' } });
    fireEvent.change(screen.getByLabelText('السعر المتوقع لليلة (ر.س) *'), { target: { value: '450' } });
    fireEvent.change(screen.getByLabelText('نسبة الإشغال المتوقعة (٪) *'), { target: { value: '70' } });
    fireEvent.click(screen.getByRole('button', { name: 'تحليل الصفقة' }));

    expect(await screen.findByText('أعد التفاوض على الشروط')).toBeTruthy();
    expect(screen.getByText(ANALYSIS.disclaimer.ar)).toBeTruthy();
  });
});

describe('disclaimer is always rendered with results', () => {
  it('keeps the disclaimer even for sparse fallback analyses with null metrics', async () => {
    const sparse = {
      ...ANALYSIS,
      roiEstimate: null,
      rentPriceGap: null,
      counterOffer: null,
      source: 'fallback',
    };
    base44Mock.functions.invoke.mockResolvedValueOnce({ data: { success: true, analysis: sparse } });
    renderPage();

    fillLeaseForm();
    fireEvent.click(analyzeButton());

    expect(await screen.findByText(ANALYSIS.disclaimer.en)).toBeTruthy();
    // Null metrics are simply omitted — no "null" or "NaN" leaks.
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(screen.queryByText('ROI estimate')).toBeNull();
  });
});
