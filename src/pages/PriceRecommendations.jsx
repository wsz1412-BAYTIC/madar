import React, { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import FeatureGuard from '@/components/FeatureGuard';
import RecommendationCard from '@/components/pricing/RecommendationCard';
import { usePropertyRecommendations, useGenerateRecommendation, useReviewRecommendation } from '@/hooks/usePriceRecommendations';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function PriceRecommendationsContent() {
  const { lang } = useLang();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities.UserProperty.filter({ userId: user.id });
        if (cancelled) return;
        setProperties(list);
        if (list.length > 0) setSelectedPropertyId(list[0].id);
      } catch {
        toast({ variant: 'destructive', description: lang === 'ar' ? 'تعذر تحميل العقارات' : 'Failed to load properties' });
      } finally {
        if (!cancelled) setLoadingProperties(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, lang, toast]);

  const { data: recommendations = [], isLoading: loadingRecommendations } = usePropertyRecommendations(selectedPropertyId);
  const generateMutation = useGenerateRecommendation(selectedPropertyId);
  const reviewMutation = useReviewRecommendation(selectedPropertyId);

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync();
      toast({ description: lang === 'ar' ? 'تم إنشاء التوصية' : 'Recommendation generated' });
    } catch {
      toast({ variant: 'destructive', description: lang === 'ar' ? 'تعذر إنشاء التوصية' : 'Failed to generate recommendation' });
    }
  };

  const review = async (recommendationId, action, payload) => {
    try {
      await reviewMutation.mutateAsync({ recommendationId, action, ...payload });
    } catch {
      toast({ variant: 'destructive', description: lang === 'ar' ? 'تعذر تنفيذ العملية' : 'Action failed' });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{lang === 'ar' ? 'التسعير الذكي' : 'Smart Pricing'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'ar'
            ? 'توصيات تسعير مبنية على حسابات دقيقة لعقارك، تتطلب موافقتك قبل أي تغيير فعلي في السعر.'
            : 'Pricing recommendations grounded in your property\'s calculated metrics — nothing changes until you approve it.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select value={selectedPropertyId ?? undefined} onValueChange={setSelectedPropertyId} disabled={loadingProperties || properties.length === 0}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder={lang === 'ar' ? 'اختر عقاراً' : 'Select a property'} />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleGenerate} disabled={!selectedPropertyId || generateMutation.isPending}>
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Sparkles className="w-4 h-4 me-1" />}
          {lang === 'ar' ? 'إنشاء توصية جديدة' : 'Generate new recommendation'}
        </Button>
      </div>

      {!loadingProperties && properties.length === 0 && (
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'لا توجد عقارات بعد.' : 'No properties yet.'}</p>
      )}

      {loadingRecommendations && selectedPropertyId && (
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      )}

      {!loadingRecommendations && selectedPropertyId && recommendations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {lang === 'ar' ? 'لا توجد توصيات بعد لهذا العقار.' : 'No recommendations yet for this property.'}
        </p>
      )}

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            isMutating={reviewMutation.isPending}
            onApprove={() => review(rec.id, 'approve')}
            onReject={(rejectionReason) => review(rec.id, 'reject', { rejectionReason })}
            onApply={(appliedPrice) => review(rec.id, 'apply', { appliedPrice })}
          />
        ))}
      </div>
    </div>
  );
}

export default function PriceRecommendations() {
  const { lang } = useLang();
  return (
    <FeatureGuard
      feature="pricing.recommendations"
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          {lang === 'ar' ? 'هذه الميزة غير متاحة في باقتك الحالية.' : 'This feature is not available on your current plan.'}
        </div>
      }
    >
      <PriceRecommendationsContent />
    </FeatureGuard>
  );
}
