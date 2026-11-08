# glasscn integration

All application glass now comes from [glasscn-components](https://glasscn-components.vercel.app/), distributed as source through the official `@glasscn` shadcn registry. The WebsiteGlass renderer and gel motion are being removed by `migrate-ui-to-glasscn`.

## Source provenance

Sources were fetched and compared on 2026-11-08 against upstream commit [`15aa50012e6b7e3c84861e66c41f2b911237c685`](https://github.com/kostyniuk/glasscn-components/tree/15aa50012e6b7e3c84861e66c41f2b911237c685). The checked-in LiquidGlass renderer, glass variants, Button/Card primitives, Input, Badge, Item and Separator matched upstream before app adaptations, apart from the existing utility formatting and renamed imports. The MIT notice is retained in `src/components/ui/glasscn/LICENSE`.

| Registry item                                                             | Upstream file at the pinned commit           | Local source                                         |
| ------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `@glasscn/liquid-glass`                                                   | `components/ui/glasscn/liquid-glass.tsx`     | `src/components/ui/glasscn/liquid-glass.tsx`         |
| `@glasscn/glass-variants`                                                 | `lib/glass-variants.ts`                      | `src/lib/glass-variants.ts`                          |
| `@glasscn/glass-card`                                                     | `components/ui/glasscn/glass-card.tsx`       | Same under `src/`                                    |
| `@glasscn/glass-button`                                                   | `components/ui/glasscn/glass-button.tsx`     | Same under `src/`                                    |
| `@glasscn/glass-input`                                                    | `components/ui/glasscn/glass-input.tsx`      | Same under `src/`                                    |
| `@glasscn/glass-badge`                                                    | `components/ui/glasscn/glass-badge.tsx`      | Same under `src/`                                    |
| `@glasscn/glass-icon`                                                     | `components/ui/glasscn/glass-icon.tsx`       | Same under `src/`                                    |
| `@glasscn/glass-item`                                                     | `components/ui/glasscn/glass-item.tsx`       | Same under `src/`                                    |
| `@glasscn/glass-scrim-card`                                               | `components/ui/glasscn/glass-scrim-card.tsx` | Same under `src/`                                    |
| `@glasscn/button`, `@glasscn/card`                                        | `components/ui/button.tsx`, `card.tsx`       | `src/components/ui/button-base.tsx`, `card-base.tsx` |
| `@glasscn/input`, `@glasscn/badge`, `@glasscn/item`, `@glasscn/separator` | Corresponding file under `components/ui/`    | Corresponding file under `src/components/ui/`        |
| `@glasscn/utils`                                                          | `lib/utils.ts`                               | `src/lib/utils.ts`                                   |

These files are declared in the upstream [registry manifest](https://github.com/kostyniuk/glasscn-components/blob/15aa50012e6b7e3c84861e66c41f2b911237c685/registry.json). To inspect an upstream file, append its table path to the pinned commit's tree URL. Typical registry installation is `npx shadcn add @glasscn/glass-card @glasscn/glass-button @glasscn/glass-input`; review the result before applying an update because the app owns adapted source. Runtime dependencies include `@base-ui/react`, `class-variance-authority`, `clsx` and `tailwind-merge`, resolved in the lockfile. There is no standalone glasscn npm runtime package.

## App adaptations

- Neutral `button-base` and `card-base` aliases avoid a cycle through the app's `Button`/`Card`. Scrim Card also imports the neutral card.
- Glass Card forwards its ref and all semantic/layout props to one stable outer host for both CSS and refractive variants. It omits the base Card's implicit flex, gap and padding; optional `contentClassName` controls an inner content wrapper. This preserves existing layouts and Radix `Content asChild` positioning/focus contracts.
- App Button keeps native button refs, event handlers, `type`, disabled and busy behavior. Icon buttons retain actual button semantics; decorative GlassChip is a span and cannot become an extra tab stop.
- `glassClassName` adds the official variant classes to an existing semantic host, plus `glasscn-material` and `glasscn-variant-*` markers. This supports links, status labels and animated switches without nesting extra buttons.
- Component defaults follow the role policy below instead of adding SVG refraction to every item. CSS variant components expose material markers for shared tokens and fallbacks.
- LiquidGlass keeps the upstream displacement-map algorithm and capability fallback. A shared material marker lets reduced-transparency/no-backdrop rules override its inline optical styles. Decorative layers do not receive pointer events or focus.
- `FormInput` preserves a visible focus ring around its CSS glass variant and accepts the app's icon, input props and accessible label.

## Material policy and coverage

| UI role                                                    | Material                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Header and prominent floating action area                  | `liquid-refract`, limited to these prominent surfaces                       |
| Main cards, statistics, login and thanks                   | `liquid` CSS                                                                |
| Repeated candidates, ballot slots and ranking rows         | `subtle` or `frosted`                                                       |
| Buttons and inputs                                         | `liquid`; secondary small controls may use `clear`/`subtle`                 |
| Status chips, decorative icon surfaces, palette and switch | `clear`/`subtle` on the correct semantic element                            |
| Dialogs, deleted-candidate drawer and error surfaces       | `frosted`/readable tinted surface with an isolating backdrop                |
| Charts                                                     | Glass container/controls; ECharts content and tooltip use shared app tokens |

The `liquid` material uses a near-clear tint: 2.5% white in light mode and 1.2% in dark mode, with sheen layers kept deliberately faint. Refractive surfaces use a 10% light / 2.5% dark base. Dialogs and sheets use translucent fallback-color fills (24% light / 34% dark) over the blurred backdrop, including the deleted-candidate sheet on `/import-file`. Opaque fallbacks remain for browsers or preferences that disable transparency so text stays readable.

Coverage includes `/vote` with unavailable/closed/error states and ballot dialogs, `/admin`, `/import-file` with upload/delete/restore/start states, `/dashboard` with ranking/chart/reset states, and `/thanks`. `/` redirects to `/vote`.

## Theme and fallback

`data-theme` is the single light/dark source and drives Tailwind's custom `dark` variant. `data-palette` selects green/navy independently. The existing `appearance-theme` and `appearance-palette` storage keys are retained. Semantic background, foreground, primary, muted, destructive, input, ring and radius tokens map to app tokens; `--glass-panel`, `--glass-fallback` and `--glass-border` remain chart-compatible aliases.

Each of light/green, light/navy, dark/green and dark/navy must be checked independently, including portaled panels and first paint after reload. The background remains the existing static app color. Glass does not require new page imagery or animated blobs.

Chromium uses upstream SVG refraction for the limited refractive surfaces; browsers without SVG backdrop use the upstream blur path. With no backdrop-filter the material uses an opaque theme fallback. Reduced transparency disables decorative optics and increases surface opacity, including portals; reduced motion disables material drift and theme reveal. Capability/preference markers in the theme bootstrap/provider make these paths deterministic and inspectable.

## Verification

Use test-only administrator settings when starting the local test server: `ADMIN_ROLE=ADMIN`, `ADMIN_PASSCODE=reset-test-pin`, and `ADMIN_SESSION_SECRET` of at least 32 characters. Do not use production credentials. Browser tests mock election/vote/roster endpoints while the local login/session route uses this test configuration.

```sh
npm ls @base-ui/react class-variance-authority
npx tsc --noEmit
npm run build
npm run test:e2e
```

The browser server is selected by `PLAYWRIGHT_BASE_URL` (default `http://127.0.0.1:4173`). `PLAYWRIGHT_EXECUTABLE_PATH` may select an installed browser. Ballot regression tests verify the current tap-to-select, view-ballot and confirmation flow. Roster/reset tests verify cancel, pending, Escape and focus restoration. Appearance tests cover theme/palette persistence and fallback preferences.

Final integration observations are recorded below.

## Verification record

On 2026-11-08, `npm run build` and `npx tsc --noEmit --incremental false` passed. The focused Chromium suite passed 21 ballot, roster, reset, appearance and dense-list cases; its 16-case viewport matrix rendered all five routes at 375×812, 812×375, 768×1024 and 1440×900 in all four theme/palette combinations without horizontal overflow. Contrast checks for primary and muted text against fallback surfaces passed at 4.5:1 or higher. Two fallback cases also passed in Microsoft Edge: reduced transparency and simulated missing `backdrop-filter`. Browser assertions cover dialog focus return, mobile ballot actions, route/theme persistence, chart rankings, PIN errors and cancellation. These test results are the saved observation record for the responsive matrix; Playwright traces remain available under its ignored `test-results/` directory.
