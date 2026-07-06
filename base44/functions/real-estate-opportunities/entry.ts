import { createClientFromRequest } from "npm:@base44/sdk";

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const CITIES = new Set(["Jeddah", "Riyadh", "Makkah"]);
const BUDGET_RANGES = new Set(["Less than 1M SAR", "1M–2M SAR", "2M–5M SAR", "5M–10M SAR", "More than 10M SAR"]);
const CONTACT_METHODS = new Set(["phone", "whatsapp", "email"]);
const TEASER_FIELDS = [
  "id",
  "public_teaser_title",
  "city",
  "required_capital_range_public",
  "expected_return_range_public",
  "expected_holding_period",
  "opportunity_type",
  "confidence_label_public",
  "growth_catalyst_type",
  "teaser_image_public",
];

function isEnabled() {
  return TRUE_VALUES.has(String(Deno.env.get("REAL_ESTATE_OPPORTUNITIES_ENABLED") || "").toLowerCase());
}

function sanitizeOpportunity(opportunity) {
  return Object.fromEntries(TEASER_FIELDS.map((field) => [field, opportunity?.[field] ?? null]));
}

function badRequest(message) {
  return Response.json({ error: message }, { status: 400 });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list_teasers";

    if (!isEnabled()) {
      return Response.json({ enabled: false, opportunities: [] });
    }

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sr = base44.asServiceRole;

    if (action === "list_teasers") {
      const { city, budgetRange } = body.filters || {};
      if (!CITIES.has(city)) return badRequest("Invalid city");
      if (!BUDGET_RANGES.has(budgetRange)) return badRequest("Invalid budget range");

      const opportunities = await sr.entities.RealEstateOpportunity.filter({
        city,
        required_capital_range_public: budgetRange,
        status: "approved",
        visibility: "subscriber_teaser",
      });

      return Response.json({
        enabled: true,
        opportunities: (opportunities || []).map(sanitizeOpportunity),
      });
    }

    if (action === "create_request") {
      const { opportunityId, form = {} } = body;
      if (!opportunityId) return badRequest("opportunityId required");
      if (!String(form.name || "").trim()) return badRequest("name required");
      if (!String(form.mobile || "").trim()) return badRequest("mobile required");
      if (!CONTACT_METHODS.has(form.preferredContactMethod)) return badRequest("Invalid contact method");
      if (!BUDGET_RANGES.has(form.budgetRange)) return badRequest("Invalid budget range");
      if (form.agreementAccepted !== true) return badRequest("agreementAccepted required");

      const opportunity = await sr.entities.RealEstateOpportunity.get(opportunityId);
      if (!opportunity || opportunity.status !== "approved" || opportunity.visibility !== "subscriber_teaser") {
        return Response.json({ error: "Opportunity unavailable" }, { status: 404 });
      }

      const now = new Date().toISOString();
      const requestRecord = await sr.entities.OpportunityRequest.create({
        opportunityId: opportunity.id,
        opportunityTeaserTitle: opportunity.public_teaser_title || "",
        userId: user.id,
        userEmail: user.email || "",
        name: String(form.name).trim(),
        mobile: String(form.mobile).trim(),
        preferredContactMethod: form.preferredContactMethod,
        budgetRange: form.budgetRange,
        message: String(form.message || "").trim(),
        agreementAccepted: true,
        status: "new",
        createdAt: now,
      });

      await sr.entities.RealEstateOpportunity.update(opportunity.id, {
        client_request_count: (Number(opportunity.client_request_count) || 0) + 1,
        last_client_request_at: now,
      });

      return Response.json({
        success: true,
        requestId: requestRecord.id,
        opportunity: sanitizeOpportunity(opportunity),
      });
    }

    return badRequest("Unknown action");
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
