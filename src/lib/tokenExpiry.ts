// Client-side JWT claim reads (JaMmusic#1121, #1124). Decode the token payload
// WITHOUT the signing secret — the browser only needs claims like `exp`/`sub` to
// drive the UI and the auto-logout; the backend does the real signature
// verification on every request. Decoding without the secret is what keeps
// HashString OUT of the client bundle (it must never ship to the browser).

export function getTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const part = (token || '').split('.')[1];
    if (!part) return null;
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getTokenExp(token: string): number | null {
  const exp = getTokenPayload(token)?.exp;
  return typeof exp === 'number' ? exp : null;
}

// The token subject (the user id). Returns null when the token has no readable
// `sub` — callers treat that as an unusable token.
export function getTokenSub(token: string): string | null {
  const sub = getTokenPayload(token)?.sub;
  return typeof sub === 'string' ? sub : null;
}

// True when the token carries an `exp` that is at/before `nowMs`. A token with
// no readable `exp` returns false (we can't prove it's expired, so don't force a
// logout on it — the on-mount /user re-validation still gates those).
export function isTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return false;
  return exp * 1000 <= nowMs;
}
