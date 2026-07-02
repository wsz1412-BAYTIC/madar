import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_LABEL = {
  pending_review: { en: 'Pending Review', ar: 'بانتظار المراجعة', variant: 'secondary' },
  approved: { en: 'Approved', ar: 'تمت الموافقة', variant: 'default' },
  rejected: { en: 'Rejected', ar: 'مرفوض', variant: 'destructive' },
  applied: { en: 'Applied', ar: 'تم التطبيق', variant: 'default' },
  expired: { en: 'Expired', ar: 'منتهي الصلاحية', variant: 'outline' },
};

const CONFIDENCE_LABEL = {
  low: { en: 'Low confidence', ar: 'ثقة منخفضة' },
  medium: { en: 'Medium confidence', ar: 'ثقة متوسطة' },
  high: { en: 'High confidence', ar: 'ثقة عالية' },
};

function MetricRow({ labelEn, labelAr, value, suffix = '' }) {
  const { lang } = useLang();
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{lang === 'ar' ? labelAr : labelEn}</span>
      <span className="font-medium">{value}{suffix}</span>
    </div>
  );
}

export default function RecommendationCard({ recommendation, onApprove, onReject, onApply, isMutating }) {
  const { lang } = useLang();
  const [rejectionReason, setRejectionReason] = useState('');
  const [appliedPrice, setAppliedPrice] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const status = STATUS_LABEL[recommendation.status] || STATUS_LABEL.pending_review;
  const confidence = CONFIDENCE_LABEL[recommendation.confidence] || CONFIDENCE_LABEL.medium;
  const metrics = recommendation.inputMetrics || {};
  const isFallback = recommendation.source === 'fallback';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          {isFallback ? <ShieldAlert className="w-5 h-5 text-amber-500" /> : <Sparkles className="w-5 h-5 text-primary" />}
          <CardTitle className="text-base">
            {lang === 'ar' ? 'توصية تسعير' : 'Pricing Recommendation'}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{lang === 'ar' ? confidence.ar : confidence.en}</Badge>
          <Badge variant={status.variant}>{lang === 'ar' ? status.ar : status.en}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isFallback && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            {lang === 'ar'
              ? 'تعذر الوصول إلى خدمة الذكاء الاصطناعي، هذه توصية أساسية مبنية على الحسابات الثابتة فقط.'
              : 'AI service was unavailable — this is a deterministic fallback recommendation.'}
          </p>
        )}

        <div dir="rtl" className="text-right space-y-2">
          <p className="text-sm leading-relaxed">{recommendation.summaryAr}</p>
          {recommendation.actionsAr?.length > 0 && (
            <ul className="list-disc pr-5 space-y-1 text-sm">
              {recommendation.actionsAr.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          )}
          {recommendation.caveatsAr?.length > 0 && (
            <ul className="pr-5 space-y-1 text-xs text-muted-foreground italic">
              {recommendation.caveatsAr.map((caveat, i) => (
                <li key={i}>{caveat}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-2">
            {lang === 'ar' ? 'نطاق السعر الموصى به' : 'Recommended price range'}
          </p>
          <p className="text-lg font-semibold">
            {recommendation.recommendedPriceMin} - {recommendation.recommendedPriceMax} {recommendation.currency}
          </p>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-1">{lang === 'ar' ? 'الأدلة المستخدمة' : 'Evidence used'}</p>
          <MetricRow labelEn="Occupancy rate" labelAr="نسبة الإشغال" value={metrics.occupancyRate != null ? Math.round(metrics.occupancyRate * 100) : null} suffix="%" />
          <MetricRow labelEn="ADR" labelAr="متوسط سعر الليلة" value={metrics.adr} suffix={` ${metrics.currency || ''}`} />
          <MetricRow labelEn="RevPAR" labelAr="الإيراد لكل ليلة متاحة" value={metrics.revpar} suffix={` ${metrics.currency || ''}`} />
          <MetricRow labelEn="Net revenue" labelAr="صافي الإيراد" value={metrics.netRevenue} suffix={` ${metrics.currency || ''}`} />
          <MetricRow labelEn="Break-even price" labelAr="سعر التعادل" value={metrics.breakEvenPrice} suffix={` ${metrics.currency || ''}`} />
          <MetricRow labelEn="Data quality score" labelAr="درجة جودة البيانات" value={metrics.dataQualityScore} suffix="/100" />
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'صالح حتى' : 'Valid until'}: {new Date(recommendation.validUntil).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
        </p>

        {recommendation.status === 'pending_review' && (
          <div className="flex flex-col gap-2">
            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button size="sm" disabled={isMutating} onClick={onApprove} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 me-1" />
                  {lang === 'ar' ? 'موافقة' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" disabled={isMutating} onClick={() => setShowRejectForm(true)} className="flex-1">
                  <XCircle className="w-4 h-4 me-1" />
                  {lang === 'ar' ? 'رفض' : 'Reject'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder={lang === 'ar' ? 'سبب الرفض' : 'Rejection reason'}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isMutating || !rejectionReason.trim()}
                    onClick={() => onReject(rejectionReason)}
                  >
                    {lang === 'ar' ? 'تأكيد الرفض' : 'Confirm reject'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {recommendation.status === 'approved' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {lang === 'ar'
                ? 'تمت الموافقة على هذه التوصية. لن يتم تغيير أي سعر إلا بعد إدخال السعر الفعلي وتأكيده هنا.'
                : 'This recommendation is approved. No price changes anywhere until you confirm the actual price applied here.'}
            </p>
            {!showApplyForm ? (
              <Button size="sm" onClick={() => setShowApplyForm(true)}>
                {lang === 'ar' ? 'تسجيل تطبيق السعر' : 'Record price applied'}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder={lang === 'ar' ? 'السعر المطبق فعلياً' : 'Actual price applied'}
                  value={appliedPrice}
                  onChange={(e) => setAppliedPrice(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={isMutating || !appliedPrice || Number(appliedPrice) <= 0}
                    onClick={() => onApply(Number(appliedPrice))}
                  >
                    {lang === 'ar' ? 'تأكيد التطبيق' : 'Confirm applied'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowApplyForm(false)}>
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {recommendation.status === 'applied' && recommendation.appliedPrice != null && (
          <p className="text-sm">
            {lang === 'ar' ? 'السعر المطبق' : 'Applied price'}: <strong>{recommendation.appliedPrice} {recommendation.currency}</strong>
          </p>
        )}

        {recommendation.status === 'rejected' && recommendation.rejectionReason && (
          <p className="text-sm text-muted-foreground">
            {lang === 'ar' ? 'سبب الرفض' : 'Rejection reason'}: {recommendation.rejectionReason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
