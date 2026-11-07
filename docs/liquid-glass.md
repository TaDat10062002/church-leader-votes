# WebsiteGlass integration

The UI uses source components downloaded from the official
[WebsiteGlass registry](https://websiteglass.com/docs):

```sh
npx shadcn@latest add https://websiteglass.com/r/glass-card.json https://websiteglass.com/r/glass-button.json https://websiteglass.com/r/glass-input.json
```

This installs `glass.tsx`, `glass-motion.ts`, `glass-card.tsx`,
`glass-button.tsx`, and `glass-input.tsx` under `src/components/ui`.
These are locally owned source files, rather than a `websiteglass` npm package.
The project now uses Tailwind CSS 4 with `@tailwindcss/postcss`, `clsx`, and
`tailwind-merge`. Theme tokens live in `src/app/globals.css`; shadcn's config
therefore has an empty `tailwind.config` path.

## UI coverage

| UI | Integration |
| --- | --- |
| Cards, candidate lists, ballot slots, statistics, rankings, thanks page | `GlassCard` / `GlassSurface` |
| Navigation headers and floating action panels | `GlassSurface` with the registry's `GlassLens` engine |
| Buttons, avatar drag handles, removal controls | `GlassButton` and its imperative gel animation |
| Administrator PIN | `GlassInput` with light theme focus treatment |
| Confirmation dialogs and deleted-candidate drawer | Existing native dialog / Radix behavior with `GlassCard` surfaces |
| Badges, chart bars, tooltip, alerts | Matching glass palette and styling |

## Local adaptations

- The app explicitly selects the light theme and keeps green text over very
  lightly tinted glass. Surface tint uses the library minimum effective value.
- `Card` preserves existing flex/grid layouts via the surface's content wrapper.
  Decorative layers sit behind content and ignore pointer events.
- The button preserves native refs and event handlers used by Radix and dnd-kit.
  Its animation subscription is cleaned up on unmount and respects reduced motion.
- Header/action lenses are measured with `ResizeObserver`; normal cards use the
  less expensive `GlassSurface` treatment. Chromium gets SVG refraction; Safari
  and Firefox use the library's frosted backdrop fallback.
- CSS provides reduced transparency and no-backdrop-filter fallbacks. Portaled
  panels have a stronger tint for readability over page content.

Review these adaptations before overwriting components with future registry updates.

Browser regression tests use mocked election/vote/roster endpoints. Run the local
test server with `ADMIN_ROLE=ADMIN`, `ADMIN_PASSCODE=reset-test-pin`, and a test-only
`ADMIN_SESSION_SECRET` of at least 32 characters before running `npm run test:e2e`.
