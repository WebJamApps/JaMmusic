# styles rules



- **Accessible Keyboard Navigation and Focus Indicators (`:focus-visible` without `outline: none`)**: When styling interactive controls, group buttons, or custom disclosure widgets (such as sidebar fold-open group toggles), never remove native keyboard focus with `outline: none;` without providing an explicit, contrasting `:focus-visible` outline (e.g. `outline: 2px solid var(--sidebar-fg-hover); outline-offset: 2px;`). Stripping outlines prevents keyboard-only users from seeing which control is active. Always verify keyboard navigation by focusing the control, confirming with `window.getComputedStyle` that `outlineStyle` is not `none` and `outlineWidth >= 1px`, and verifying that standard keyboard actuation keys (`Enter` and `Space`) expand and collapse the control.
