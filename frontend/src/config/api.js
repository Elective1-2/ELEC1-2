const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHostname(hostname) {
  return LOCAL_HOSTNAMES.has((hostname || '').toLowerCase());
}

function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_URL || '/api').trim();

  if (typeof window === 'undefined') {
    return configured;
  }

  // In production browser sessions, never call localhost from client code.
  // Fallback to same-origin /api so requests hit the deployed backend.
  const isCurrentHostLocal = isLocalHostname(window.location.hostname);
  if (!isCurrentHostLocal) {
    try {
      const parsed = new URL(configured, window.location.origin);
      if (isLocalHostname(parsed.hostname)) {
        return '/api';
      }
    } catch {
      return '/api';
    }
  }

  return configured;
}

export const API_BASE = resolveApiBase();
export const API_ROOT = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
