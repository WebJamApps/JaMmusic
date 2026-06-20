import jwt from 'jwt-simple';
import { getTokenExp, isTokenExpired } from 'src/lib/tokenExpiry';

const SECRET = 'test-secret';
const nowSec = () => Math.floor(Date.now() / 1000);

describe('tokenExpiry', () => {
  describe('getTokenExp', () => {
    it('reads the exp claim from a token', () => {
      const exp = nowSec() + 100;
      const token = jwt.encode({ sub: 'u', iat: nowSec(), exp }, SECRET);
      expect(getTokenExp(token)).toBe(exp);
    });
    it('returns null for a token with no exp', () => {
      const token = jwt.encode({ sub: 'u', iat: nowSec() }, SECRET);
      expect(getTokenExp(token)).toBeNull();
    });
    it('returns null for empty / garbage input', () => {
      expect(getTokenExp('')).toBeNull();
      expect(getTokenExp('not-a-jwt')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('is true for a token whose exp is in the past', () => {
      const token = jwt.encode({ sub: 'u', iat: nowSec() - 200, exp: nowSec() - 100 }, SECRET);
      expect(isTokenExpired(token)).toBe(true);
    });
    it('is false for a token whose exp is in the future', () => {
      const token = jwt.encode({ sub: 'u', iat: nowSec(), exp: nowSec() + 24 * 60 * 60 }, SECRET);
      expect(isTokenExpired(token)).toBe(false);
    });
    it('is exactly at the boundary (exp === now) => expired', () => {
      const exp = nowSec();
      const token = jwt.encode({ sub: 'u', iat: exp, exp }, SECRET);
      expect(isTokenExpired(token, exp * 1000)).toBe(true);
    });
    it('is false when exp cannot be determined (no logout on unknowns)', () => {
      const noExp = jwt.encode({ sub: 'u', iat: nowSec() }, SECRET);
      expect(isTokenExpired(noExp)).toBe(false);
      expect(isTokenExpired('')).toBe(false);
    });
  });
});
