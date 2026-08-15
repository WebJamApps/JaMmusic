import { defaultAuth } from 'src/providers/Auth.provider';

export const handle401 = (redirect = true): void => {
  try {
    localStorage.setItem('auth', JSON.stringify(defaultAuth));
  } catch (err) {
    console.log((err as Error).message);
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('auth:logout'));
    if (redirect && window.location && typeof window.location.assign === 'function') {
      if (window.location.pathname && window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }
  }
};

export async function customFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    handle401();
  }
  return res;
}

export default { handle401, customFetch };
