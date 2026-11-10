# providers rules



- **Context provider action return contracts**: When context methods (like `getSongs`, `getGigs`,
  `getPics`) are consumed by action handlers to obtain uncached data imperatively (e.g.
  `const data = await getSongs()`), the provider function must actually return the underlying fetch
  promise/result (e.g. `export const makeGetSongs = (setSongs) => async () => await fetchSongs.getSongs(setSongs)`),
  rather than discarding the return value (`await fetch(...)` without `return`). Otherwise, local
  callers receive `undefined` and fall back to error/static states because React's asynchronous state
  setter does not update local variables in the caller's stack.


- **Distinguishing Socket Server Failures vs Empty Data**: In components consuming socket-fetched collections (`gigs`, `pics`), set state to `null` on connection failure/timeout (`CONNECTION_TIMEOUT_MS = 8000`) so components render inline error banners (`.gigs-error-message`, `.pics-error-message`) rather than rendering an identical empty UI state as a 0-item dataset (`[]`).


- **ESLint `unicorn/prefer-classlist-toggle` in Theme and Class Synchronization Effects**: When updating DOM class lists based on reactive boolean state (such as syncing theme `dark-mode` onto `document.documentElement`), ESLint's `unicorn/prefer-classlist-toggle` forbids manual `if (active) el.classList.add(...) else el.classList.remove(...)` branches. Always use `el.classList.toggle('class-name', booleanCondition)` directly.
