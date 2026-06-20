// Client-side JWT expiry check (JaMmusic#1121). Reads the `exp` claim from the
// token payload WITHOUT the signing secret — the browser only needs to know
// whether to log out; the backend does the real signature verification. Decoding
// without the secret also avoids shipping HashString to the client for this.

export function getTokenExp(token: string): number | null {
  try {
    const part = (token || '').split('.')[1];
    if (!part) return null;
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

// True when the token carries an `exp` that is at/before `nowMs`. A token with
// no readable `exp` returns false (we can't prove it's expired, so don't force a
// logout on it — the on-mount /user re-validation still gates those).
export function isTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return false;
  return exp * 1000 <= nowMs;
}
