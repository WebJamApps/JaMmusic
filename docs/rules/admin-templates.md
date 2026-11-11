# admin-templates rules



- **Admin Stage Tabs and Personalization Tokens E2E Browser Test Coverage**: When adding or updating template stages, tabs, or personalization tokens in `AdminTemplates` (or similar admin views), unit test coverage alone is not sufficient. Dedicated browser tests (`test/e2e/admin-templates-stage-tabs.spec.ts`) must be extended to include fixtures for the new stages, click each new tab, assert its `aria-selected` active/inactive states across tabs, verify loaded values for configured types and empty values for unconfigured types, and exercise token insertion and revert functionality in the browser DOM.
