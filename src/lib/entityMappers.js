import { base44 } from "@/api/base44Client";

/**
 * Infer the platform from a listing URL.
 */
export function inferPlatform(url) {
  if (!url) return "other";
  const lower = url.toLowerCase();
  if (lower.includes("airbnb")) return "airbnb";
  if (lower.includes("booking.com") || lower.includes("booking.")) return "booking";
  if (lower.includes("gatherin")) return "gatherin";
  return "other";
}

/**
 * Maps a UserProperty entity record to the shape expected by
 * PropertyCard, FeaturedCard, PropertyDetail, and PropertySearch.
 *
 * Entity field → Component field:
 *   property_name → title
 *   max_guests    → guests
 *   featured_image/images[0] → featured_image, image
 *   property_url  → platform_urls[0]
 */
export function mapUserProperty(entity) {
  if (!entity) return null;

  const featuredImage = entity.featured_image || entity.images?.[0] || null;
  const images =
    entity.images?.length > 0
      ? entity.images
      : featuredImage
      ? [featuredImage]
      : [];

  return {
    ...entity,
    id: entity.id,
    title: entity.property_name || "—",
    price: entity.price,
    bedrooms: entity.bedrooms,
    guests: entity.max_guests,
    rating: entity.rating,
    city: entity.city,
    neighborhood: entity.neighborhood,
    description: entity.description || entity.notes || "",
    short_description: entity.short_description || "",
    amenities: entity.amenities || [],
    featured_image: featuredImage,
    image: featuredImage,
    images,
    platforms: [],
    platform_urls: entity.property_url ? [entity.property_url] : [],
  };
}

/**
 * Maps a PriceRecommendation entity record to the "opportunity" shape
 * expected by OpportunityWallet, ActionCenter, WhatWouldMadarDo, ReasoningBox.
 *
 * Entity field → Component field:
 *   user_property_id → property_id
 *   reasoning_ar/en  → reason_ar/en (for pickLangField(opportunity, "reason"))
 *   reasoning_ar/en  → reasoning_ar/en (for brief-style access)
 */
export function mapRecommendation(entity, property) {
  if (!entity) return null;

  return {
    ...entity,
    id: entity.id,
    property_id: entity.user_property_id,
    revenue_impact: entity.revenue_impact,
    recommended_price: entity.recommended_price,
    current_price: entity.current_price,
    confidence_score: entity.confidence_score,
    action_ar: entity.action_ar || "",
    action_en: entity.action_en || "",
    reasoning_ar: entity.reasoning_ar || entity.reasoning || "",
    reasoning_en: entity.reasoning_en || entity.reasoning || "",
    reason_ar: entity.reasoning_ar || entity.reasoning || "",
    reason_en: entity.reasoning_en || entity.reasoning || "",
    property: property || null,
  };
}

/**
 * Maps a preview object (from madarApi.previewProperty) to the
 * UserProperty create payload.
 */
export function previewToEntity(preview, url) {
  return {
    property_url: url,
    property_name: preview.title || "",
    platform: inferPlatform(url),
    city: preview.city || "",
    neighborhood: preview.neighborhood || "",
    bedrooms: preview.bedrooms != null ? Number(preview.bedrooms) : undefined,
    bathrooms: preview.bathrooms != null ? Number(preview.bathrooms) : undefined,
    max_guests: preview.guests != null ? Number(preview.guests) : undefined,
    price: preview.price != null ? Number(preview.price) : undefined,
    rating: preview.rating != null ? Number(preview.rating) : undefined,
    description: preview.description || "",
    short_description: preview.short_description || "",
    amenities: preview.amenities || [],
    featured_image: preview.featured_image || preview.image || null,
    images: preview.images || (preview.featured_image || preview.image ? [preview.featured_image || preview.image] : []),
    is_active: true,
  };
}

export { base44 };