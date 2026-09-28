import { init } from '@plausible-analytics/tracker';

// Plausible: cookieless, aggregate page-view counts, EU-hosted. Chosen because
// it needs no consent banner — it stores nothing on the device and builds no
// profile. Swapping in a tracker that sets cookies (GA, Hotjar…) means a
// consent banner BEFORE it loads, and a privacy-policy update.
//
// Off unless VITE_PLAUSIBLE_DOMAIN is set (e.g. in the Amplify branch's
// environment variables), so sandboxes, previews and tests send nothing.
export const ANALYTICS_DOMAIN: string = import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? '';

export function isAnalyticsEnabled(domain = ANALYTICS_DOMAIN): boolean {
  return domain.trim() !== '';
}

export function initAnalytics(domain = ANALYTICS_DOMAIN): boolean {
  if (!isAnalyticsEnabled(domain)) return false;
  init({ domain: domain.trim() });
  return true;
}
