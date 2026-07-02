import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function usePropertyRecommendations(propertyId) {
  return useQuery({
    queryKey: ['price-recommendations', propertyId],
    queryFn: () => base44.entities.PriceRecommendation.filter({ propertyId }, '-generatedAt'),
    enabled: !!propertyId,
  });
}

export function useGenerateRecommendation(propertyId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('generate-price-recommendation', { propertyId });
      return res.data.recommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-recommendations', propertyId] });
    },
  });
}

export function useReviewRecommendation(propertyId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recommendationId, action, ...payload }) => {
      const res = await base44.functions.invoke('review-price-recommendation', {
        recommendationId,
        action,
        ...payload,
      });
      return res.data.recommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-recommendations', propertyId] });
    },
  });
}
