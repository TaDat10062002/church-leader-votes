# Proposal

## Why

The application currently presents its interface in Vietnamese only, which makes it difficult for Traditional Chinese speakers to use the election flow. Supporting Vietnamese and Traditional Chinese throughout the voter and administrator experiences will make the app usable by both language groups while preserving Vietnamese as the default.

## What Changes

- Add Vietnamese (`vi`) and Traditional Chinese (`zh-TW`) translations for application generated content across voting, confirmation, administrator login, roster import, and results.
- Let users select a language and remember that choice in a cookie across routes and page reloads; use Vietnamese when no valid preference is saved.
- Keep the document language and localized metadata aligned with the selected language, and localize accessible labels and generated Excel template content.
- Preserve candidate names and other user supplied election data as entered.

## Capabilities

### New Capabilities

- `localized-interface`: Language selection, preference persistence, and localized application generated content for Vietnamese and Traditional Chinese.

### Modified Capabilities

None.

## Impact

- Next.js App Router layout and all user facing pages and components, including the theme controls, voter ballot, thank-you and closed-election states, administrator login, roster import, and results dashboard.
- Client/server boundaries for loading the saved language, HTML `lang` and metadata, accessible labels, date/number formatting, and generated Excel templates.
- No election schema or candidate data changes are expected. A new runtime dependency is not assumed; the implementation can use typed in-project translation dictionaries unless investigation finds a concrete limitation.
