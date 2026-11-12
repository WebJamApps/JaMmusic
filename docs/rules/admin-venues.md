# admin-venues rules



- **TypeScript Number Comparison in Form States**: In `@mui/material` dialog forms, numeric fields (such as `gigInterval` inside form state) are
  typed as `number`. Comparing a numeric state variable against string empty (`form.gigInterval !== ''`) will cause a compilation error
  `TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.` Ensure you check
  `typeof form.field === 'number'` or keep form states properly type-separated.


- **Venue Form Optional Enums & Derived-With-Override Attributes (`familyNearby`)**: In `EditVenueDialog`, optional enum fields (`templateOverride`, `audienceAttention`, `venueType`) must never be sent as empty strings (`""`) in request payloads, as backend Mongoose schema validation rejects empty strings against allowed enum values; omit or delete empty enum values before sending. `familyNearby` is a two-mode field with server-managed `familyNearbyOverride`: when the client sends no explicit `familyNearby` key, the backend derives proximity from the venue address via `web-jam-back`'s `isFamilyNearby()` (geo-distance) with `familyNearbyOverride: false`; when a human explicitly toggles the checkbox, the client sends an explicit boolean (`true`/`false`), which the backend stores verbatim and sets `familyNearbyOverride: true` to protect the manual choice from address recomputes. The backend also supports `familyNearby: null` to clear the override and restore address derivation. The front-end therefore exposes a 3-state UI ('Auto-derived' vs 'Manual override') with an explicit 'Recompute from address' affordance when overridden, sending `familyNearby: null` on save to clear the override and restore derive-by-default, and omitting the key when untouched so existing override status or automatic address recomputes stay in force.


- **MUI Select `renderValue` vs `MenuItem` Test ID Collision**: When rendering customized chips or controls inside both a `<Select>`'s `renderValue` and its default/empty `<MenuItem>` (e.g. "no type" badge), never place the same `data-testid` on both elements. While the select menu is open, both instances are present in the DOM simultaneously, causing `getByTestId` queries to fail with an ambiguous element error. Maintain the canonical test ID exclusively on the `renderValue` child, and leave the `<MenuItem>` chip untagged or with a distinct option-specific test ID. Furthermore, ensure unit test mocks for `@mui/material`'s `<Select>` execute `props.renderValue(value)` so that test queries targeting elements inside `renderValue` resolve properly in unit test suites.


- **Conditional Predictions on Multi-Candidate Existing-Entity Warnings**: When building pre-save duplicate or existing-record warnings that match across multiple fields (e.g. name, city, address), never emit unconditional creation or outcome predictions (such as asserting that a different-city match "will result in creating a separate venue") when candidates in the target scope (such as same-city records) exist that could result in an update upon save (via street address normalization or address-less fallback). Warnings must remain conditional or omit the prediction, explaining the actual matching candidates, stating the backend save rules, and preserving the authoritative server-side outcome (e.g. HTTP 200 updated vs 201 created).
