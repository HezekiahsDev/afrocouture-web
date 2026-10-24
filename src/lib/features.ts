/**
 * AI Studio needs Vertex credentials on the API. Until they are in place the studio
 * shows "coming soon" and ideas go straight into a commission with reference photos.
 * Set NEXT_PUBLIC_AI_STUDIO_ENABLED=true (and redeploy) to switch it on.
 */
export const AI_STUDIO_ENABLED = process.env.NEXT_PUBLIC_AI_STUDIO_ENABLED === 'true';
