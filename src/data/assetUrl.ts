// The single-file build supplies these resources before React starts.
declare global {
  interface Window {
    __SITE_ASSETS__?: Record<string, string>
  }
}

export function assetUrl(path: string) {
  return window.__SITE_ASSETS__?.[path] ?? `${import.meta.env.BASE_URL}${path}`
}
