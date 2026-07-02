// Deno backend function. This is the ONLY place in the app that records a
// price as "applied" — it always requires an explicit prior "approve" by an
// authenticated human, enforced by recommendationWorkflow.js.
import { createClientFromRequest } from "npm:@base44/sdk";
import { applyTransition, RecommendationWorkflowError } from "./recommendationWorkflow.js";

const ERROR_STATUS = {
  unknown_action: 400,
  missing_actor: 400,
  missing_field: 400,
  invalid_transition: 409,
  expired: 409,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const [user, body] = await Promise.all([base44.auth.me(), req.json()]);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recommendationId, action, ...payload } = body;
    if (!recommendationId || typeof recommendationId !== "string") {
      return Response.json({ error: "recommendationId is required" }, { status: 400 });
    }

    // .get() may resolve null/undefined OR throw on a missing id depending on
    // SDK version, so normalize both to a clean 404 instead of a raw 500.
    const record = await base44.asServiceRole.entities.PriceRecommendation.get(recommendationId).catch(() => null);
    if (!record) {
      return Response.json({ error: "Recommendation not found" }, { status: 404 });
    }

    const isOwner = record.userId === user.id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    let transitionResult;
    try {
      transitionResult = applyTransition(record, action, payload, user.id);
    } catch (error) {
      if (error instanceof RecommendationWorkflowError) {
        return Response.json({ error: error.message, code: error.code }, { status: ERROR_STATUS[error.code] || 400 });
      }
      throw error;
    }

    const { patch, historyEntry } = transitionResult;
    const updated = await base44.asServiceRole.entities.PriceRecommendation.update(recommendationId, {
      ...patch,
      statusHistory: [...(record.statusHistory || []), historyEntry],
    });

    return Response.json({ success: true, recommendation: updated });
  } catch (error) {
    return Response.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
});
