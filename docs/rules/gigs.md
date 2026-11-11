# gigs rules



- **Responsive Desktop Tables & Viewport Content Width**: When testing or designing desktop data tables
  (e.g. MUI X DataGrid) to eliminate horizontal scrolling at desktop breakpoints (such as 960px or 1024px),
  never sum column minimum widths against the viewport width alone. In layouts with persistent navigation
  sidebars (e.g. `.main-panel` width `calc(100% - 180px)` for viewports >= 900px) and page content padding
  (e.g. 16px left + 16px right in `.gigsDiv`), the actual available content width is significantly less than
  the viewport (at 960px, available width is only `960 - 180 - 32 = 748px`; at 1024px,
  `1024 - 180 - 32 = 812px`). Sizing strategies must ensure column minimum widths sum to less than or equal to
  the actual available content width (using `box-sizing: border-box`), and responsive column widths should
  leverage `flex` properties rather than fixed pixel widths to adapt cleanly across screen widths without
  forcing horizontal scrollbars (`scrollWidth <= clientWidth`).


- **Keyboard Activation and Event Scoping on Interactive Container Cards**: When interactive container
  cards (e.g. `GigCard`) have click and keydown handlers (e.g. opening an edit modal on click/Enter/Space),
  always scope keyboard activation strictly to `e.target === e.currentTarget` (and give the card accessible
  semantics: `role="button"`, `tabIndex={0}`, and `aria-label`). Descendant buttons (like "Announce") and
  links (venue/map/tickets) must not have their activation intercepted by the parent container: child buttons
  must call `e.stopPropagation()` on both `click` and `keydown` for Enter and Space, and container click
  handlers must ignore clicks originating from interactive child elements
  (`a, button, input, select, textarea, img`).


- **Full-Spectrum HTML Entity Decoding & Non-Breaking Spaces in Caption Converters**: When converting
  rich HTML captions (from rich-text editors like TinyMCE) to plain text for social platforms (such as
  Facebook or Instagram), never rely solely on a manual allowlist of named HTML entities (`NAMED_ENTITIES`).
  A small list leaves hundreds of valid named entities (such as `&copy;`, `&euro;`, `&trade;`, `&hellip;`)
  unparsed. In browser and jsdom environments, decode entity tokens using native browser parsing
  (`document.createElement('textarea')` with `textarea.innerHTML = entity; textarea.value` or `DOMParser`),
  turning non-breaking space codes (`&nbsp;`, `\u{A0}`) into standard plain spaces (`' '`) per design
  specifications, while falling back gracefully to numeric and named entity decoders in headless/non-browser
  contexts. Test suites must cover entities outside common ASCII sets (e.g. `&copy;`, `&euro;`, `&trade;`,
  `&hellip;`).


- **Dialog Lifecycle Separation on Collection Updates vs. Opening/Switching**: When dialogs consume parent/global
  collection lists (such as `gigs`) for auxiliary features (such as thumbnail strips or selection lists) while
  maintaining form/submission states (`submittedSuccessfully`, `hasSubmittedRef`, status messages, input edits),
  never tie form initialization to changes in the collection prop array. A post-submission refresh in the parent
  (e.g. calling `getGigs()` on success) instantiates a new array reference, which reruns the initialization effect,
  wiping out success confirmation banners, clearing clipboard/hand-off controls, and re-enabling submission buttons
  to allow accidental duplicate posts. Instead, isolate dialog reset and form initialization strictly to opening
  state transitions or entity ID changes (`open`, `gig?._id`), allowing auxiliary lists to update independently
  without resetting the open dialog's submission lifecycle.


- **Deterministic Strip Ordering with Fallback Photos & Deduplication**: When constructing ordered lists where a
  fixed default item must strictly appear at the end (or beginning), never rely on naive uniqueness checks
  (`!seen.has(defaultUrl)`) after looping through caller-provided items. If caller items contain the default URL
  (e.g. an existing gig whose `promoImageUrl` equals `defaultUrl`), processing them first inserts the default
  prematurely at an earlier index and suppresses the terminal append. Explicitly filter out or skip the fixed
  terminal element during intermediate processing, then append it once at the end. In addition, Playwright E2E
  suites testing image strips with `onError` filtering must mock valid binary image responses (e.g. 1x1 GIF) on
  routes registered after navigation fixtures to prevent 404s from removing strip elements prematurely.


- **Distinguishing Intentional Empty Field Edits from Uninitialized State**: When implementing automatic field selection
  (such as deriving a recommended starting image or template URL), never treat an empty string (`!value` or
  `value === ''`) as an uninitialized condition that triggers automatic re-population. Doing so causes intentional blank
  edits (such as clearing a field to accept a backend default or leave an optional value blank) to be immediately
  overwritten. Distinguish initial state from user edits by tracking an explicit dirty/touched ref (e.g.
  `imageEditedRef.current = true` on `onChange`/selection), resetting it strictly on dialog open or entity switch.
  Automatic fallback effects must guard on `!editedRef.current` and omit the field value from their dependency array
  so intentional clearing is preserved through subsequent collection refreshes.
