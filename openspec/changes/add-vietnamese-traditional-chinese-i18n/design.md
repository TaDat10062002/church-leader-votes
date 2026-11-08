# Design

## Context

See proposal.md for motivation and specs/localized-interface/spec.md for the behavior contract. The project is a Next.js 15 App Router application with mostly client-rendered page flows, a server root layout, a shared appearance control, JSON Route Handlers, and an ExcelJS workbook endpoint. User facing copy currently appears in both UI components and server/API messages. The root document language and dashboard time formatting are currently fixed to Vietnamese.

## Goals / Non-Goals

**Goals:**

- Use one validated locale value consistently in server rendering, client UI, API errors, metadata, and generated workbooks.
- Keep translation coverage maintainable and type checked as copy changes.
- Make language changes immediate and preserve the current route.

**Non-Goals:**

- Add locale-prefixed routes, automatic browser-language detection, or translated user supplied election records.
- Translate Supabase/database diagnostics or server logs that are not presented as application copy.
- Add a third language or a translation management service.

## Decisions

1. **Keep the existing routes and store the selected locale in a root-scoped cookie.** Use a small locale helper that accepts only `vi` and `zh-TW`, with `vi` as the fallback. The root Server Component reads the cookie and passes the validated value to a client locale provider. The language control updates the provider immediately and writes the cookie with `Path=/`, `SameSite=Lax`, and a long lifetime. The value is a non-sensitive preference, so it does not require an HttpOnly cookie. This keeps navigation and links stable while ensuring server and client renders agree after reload. URL prefixes were considered but would change every route and link; browser-only storage was rejected because the server could not render the correct document language and metadata on the initial response.

2. **Use typed in-project dictionaries and a shared translation API.** Keep matching Vietnamese and Traditional Chinese message keys in source, with interpolation for dynamic values and locale-aware `Intl` formatting for dates, times, and numbers. This fits the two fixed locales and avoids a runtime dependency. A library such as next-intl was considered, but its routing and message-loading features add complexity without a current need for route-based locales.

3. **Localize server generated responses at the request boundary.** API handlers that produce user-facing errors should return stable error codes and safe interpolation data rather than hard-coded Vietnamese text or raw internal exceptions. The UI maps those codes through the same message dictionary using its current locale. The Excel template handler reads the locale cookie and selects translated worksheet names, headings, instructions, and download filename. Server diagnostics remain server-side and are not translated into the response.

4. **Make locale available to shared controls and every page surface.** Place the language selector alongside the existing theme control, and let the shared locale provider serve all route content, including controls rendered directly on pages without the shared app header. Update the root document `lang`, localized metadata, accessible labels, chart labels, and generated copy from the same locale state.

## Risks / Trade-offs

- [Reading a cookie in the root layout makes locale-sensitive output request-specific] → Keep personalized pages and metadata uncached across users; preserve private/no-store behavior for generated workbooks and API responses.
- [A missing translation key could expose fallback-language copy] → Keep dictionary keys aligned through shared TypeScript types and review translation coverage whenever application copy is added.
- [Client locale state and the cookie could drift] → Validate cookie values on the server and update the provider and cookie together when the language control changes.
- [Chinese copy may wrap differently from Vietnamese in compact controls] → Review narrow screens and retain existing wrapping and overflow behavior when translating interface labels.

## Migration Plan

No database or election data migration is required. Deploy the locale dictionaries and provider with Vietnamese as the no-cookie fallback, then roll back by reverting the application release; existing election records and routes remain compatible.
