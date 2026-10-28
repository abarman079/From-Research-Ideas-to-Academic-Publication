/** Canonical base URL shared by metadata, sitemap and robots.txt.
 * On Vercel the production URL is available automatically.
 * To use your own domain later, set NEXT_PUBLIC_SITE_URL=https://your-domain.example.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const deploymentHost = process.env.VERCEL_URL?.trim();
  const candidate =
    configured ||
    (productionHost ? `https://${productionHost}` : undefined) ||
    (deploymentHost ? `https://${deploymentHost}` : undefined) ||
    "http://localhost:3000";
  try {
    const url = new URL(candidate);
    if (
      url.protocol !== "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    ) {
      throw new Error("Canonical base must use HTTPS");
    }
    return url.origin;
  } catch {
    // Never make a production build fail merely because an optional URL is malformed.
    return "http://localhost:3000";
  }
}

/**
 * A boss-review link should not be indexed just because it is a production deployment.
 * Allow indexing only after explicit launch approval: SITE_ALLOW_INDEXING=true.
 * `noindex` is not access control; protect confidential deployments separately.
 */
export function isIndexableDeployment(): boolean {
  if (process.env.SITE_ALLOW_INDEXING !== "true") return false;
  if (process.env.VERCEL) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}
