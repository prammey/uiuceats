import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

// Fonts are loaded in components/final/PageFinal.tsx so the page only ships the type it uses.
export const metadata: Metadata = {
  title: "UIUC Eats · Free food on campus this week",
  description:
    "Free, walk-in food events at the University of Illinois Urbana-Champaign for the next 7 days, pulled from official campus calendars with a source link on every listing.",
};

export const viewport: Viewport = {
  themeColor: "#ff5f05",
  width: "device-width",
  initialScale: 1,
};

// PostHog analytics, production only so localhost never shows up in the numbers. The key is
// a public client token; the host is our own /ingest path, which vercel.json forwards to
// PostHog so ad blockers do not drop it. Named events live in lib/analytics.ts; link and
// button clicks are captured automatically.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";
const ANALYTICS_ON = process.env.NODE_ENV === "production" && Boolean(POSTHOG_KEY);

const POSTHOG_LOADER = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="gu mu yu bu ku init Qu Zu Wu Vu Yu el Gu ec zu lc uc cc hc dc vc capture getExtension Ju fu mc calculateEventProperties gc register register_once register_for_session unregister unregister_for_session wc Uu yc getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys onActiveMatchingSurveysChanged renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync kc identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset Sc shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty bc rc createPersonProfile setInternalOrTestUser Cu xu opt_in_capturing opt_out_capturing $u has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing nc debug il Os getPageViewId captureTraceFeedback captureTraceMetric Nu".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        {ANALYTICS_ON && (
          <Script id="posthog" strategy="afterInteractive">
            {`${POSTHOG_LOADER}
posthog.init(${JSON.stringify(POSTHOG_KEY)}, { api_host: ${JSON.stringify(POSTHOG_HOST)}, ui_host: "https://us.posthog.com", defaults: "2026-05-30", person_profiles: "identified_only", disable_session_recording: true });`}
          </Script>
        )}
      </body>
    </html>
  );
}
