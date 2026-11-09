# Tasks

## 1. Locale foundation and persistence

- [x] 1.1 Add validated `vi`/`zh-TW` locale types, matching typed dictionaries, translation interpolation, and `Intl` formatting helpers; add unit coverage for supported locales, invalid-value fallback, dictionary key parity, and formatted values.
- [x] 1.2 Read the locale cookie in the root layout, pass it into a locale provider, set the document `lang` and locale-specific metadata, and add a language selector alongside the shared theme control; verify language changes update immediately, retain the current route, and persist across navigation and reloads.

## 2. Localize application flows and generated responses

- [x] 2.1 Replace hard-coded application copy across voter, ballot, closed-election, thank-you, admin login, roster import, dashboard, and theme controls with dictionary messages, including accessible names and chart labels; verify both locales cover these screens and stored candidate values are not translated or modified.
- [x] 2.2 Return stable error codes with safe interpolation data from user-facing API and roster validation paths, and render those errors through the selected locale; localize workbook sheet names, column headings, guide content, and download filename from the locale cookie; add route-level coverage for localized errors and both workbook variants.
- [x] 2.3 Define and implement the bilingual candidate data migration, including a safe policy for legacy rows whose existing `name` value has no recorded language; add separate `name_zh` and `name_vi` fields and propagate both through election creation and candidate read APIs.
- [x] 2.4 Update the roster workbook/template contract and Excel parser for Traditional Chinese name, Vietnamese name, and image columns; verify each input maps to the correct draft and persisted field.
- [x] 2.5 Update voter ballot, confirmation, accessibility text, and results views to display only the candidate name matching the selected locale; verify switching languages changes the displayed field without changing stored values.

## 3. Cross-route verification and documentation

- [x] 3.1 Add browser coverage that switches languages on voter and administrator routes, reloads and navigates with the saved preference, checks the document language and localized metadata, and confirms narrow-screen Traditional Chinese content remains readable.
- [ ] 3.2 Document the supported languages, default behavior, and cookie persistence in the project README; verify the documented behavior matches the implementation and run the project's full verification commands after all localized surfaces are integrated.
