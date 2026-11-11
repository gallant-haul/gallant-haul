// Centralized Public URL and Redirection Resolver
// Ensures email verification links point to the live cloud application or main production domain (never localhost:3000)

export function getPublicBaseUrl(): string {
  // 1. Explicit production or deployment environment variable
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL || import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // 2. Active browser origin (e.g. *.run.app cloud preview or custom domain)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // Only use browser origin if it is NOT localhost or 127.0.0.1
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/$/, '');
    }
  }

  // 3. Fallback to active live cloud application URL
  return 'https://ais-pre-nh5gcbnthuqxqn7r3z2wqj-820657649195.asia-southeast1.run.app';
}

export function getPublicRedirectUrl(path: string = '/'): string {
  const base = getPublicBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
