# Design

## Context

See `proposal.md` for the motivation. The application uses Next.js App Router and currently has a custom theme provider with a circular reveal that is reported to stutter. The theme control needs to preserve system preference, saved user choice, and application state while avoiding a flash or hydration mismatch on initial render.

## Goals / Non-Goals

**Goals:**
- Use one maintained source of truth for theme state and system preference.
- Use Magic UI's ready-made circular theme toggler rather than implementing a separate reveal handler.
- Keep the configured reveal responsive and avoid simultaneous page-wide color animation.
- Apply the effective theme before the first visible render without hydration warnings.
- Respect reduced motion and preserve an immediate fallback where View Transitions are unavailable.

**Non-Goals:**
- Handwrite or fork a separate View Transition, WAAPI, or `clip-path` reveal implementation.
- Animate page backgrounds with a separate Framer Motion implementation.
- Change the application's voting or administration behavior.
- Add a Vite initialization path to the current Next.js application.

## Decisions

### Use `next-themes` for theme state

Replace the custom provider with `next-themes`. Configure `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. Read the effective appearance through `resolvedTheme`; preserve the system choice until the user explicitly selects a theme. Update every consumer of the old `useTheme` API and remove the custom provider.

Use Magic UI's controlled component API: provide `theme` from `resolvedTheme` (normalized to `light` or `dark`) and `onThemeChange` from `setTheme`. This keeps `next-themes` responsible for persistence and keeps the component's icon and its theme state synchronized. Render the theme-dependent control after mount to avoid an incorrect initial icon or hydration mismatch.

### Use Magic UI AnimatedThemeToggler for the circular reveal

Add the component through `npx shadcn@latest add @magicui/animated-theme-toggler` and import the generated component from the project's UI component path. Use `variant="circle"`, set `duration={500}`, and leave `fromCenter` false so the reveal expands from the center of the toggle button. The component uses the View Transitions API and its built-in `clip-path` animation; do not write a separate handler, WAAPI animation, busy ref, or custom shape implementation.

Use the component's built-in immediate theme change when `document.startViewTransition` is unavailable. The component also guards activations while its transition is active. The installed component supplies the default View Transition pseudo-element behavior; retain the rules that disable the old/new root animations and use normal blending, while removing broad page-wide color transitions that would compete with the reveal.

Animate only the Sun/Moon icon swap with Framer Motion `AnimatePresence` (fade, rotate, and scale over 180 ms) and add a small `whileTap` scale to the toggle button. Set both icon and tap animation durations to zero when reduced motion is requested. Keep page surfaces and backgrounds controlled by the Magic UI reveal.

The component defaults to 400 ms, so explicitly set its configurable `duration` to 500 ms to meet the chosen interaction timing. Use the component's built-in easing rather than adding a handwritten animation override.

The component does not provide a documented reduced-motion option. Detect `prefers-reduced-motion` at the integration boundary and pass a zero duration while the preference is active; use 500 ms otherwise. This retains the supplied reveal implementation while making the transition visually immediate for users requesting reduced motion.

### Prevent theme flash and hydration mismatch

Use the `next-themes` initialization script and put `suppressHydrationWarning` on the Next.js root `<html>` element, where the class may be set before hydration. Render the Magic UI control only after mount while reserving its dimensions to avoid a visible layout shift. Use `resolvedTheme` after mount for its controlled `theme` prop. If the project is ever ported to Vite, use an inline `<head>` script that reads the saved theme and `prefers-color-scheme`; this is not part of the current Next.js implementation.

### Audit and remove competing sources of theme-change work

Before integration, profile a representative theme toggle and record rendering cost and frame behavior. Audit these likely sources of lag:

- **Global color transitions:** remove broad `transition: all` or page-wide color transitions that run alongside the reveal. Keep transitions scoped to local controls only when needed; `disableTransitionOnChange` suppresses competing transitions during a theme update.
- **Re-renders from theme consumers:** identify components subscribing to theme state, use `resolvedTheme` only where required, and avoid passing theme values through broad component trees when CSS variables can respond to the root class.
- **Heavy view-transition snapshots:** identify large or frequently changing `backdrop-filter`, blur, canvas, and WebGL surfaces. Reduce or disable effects during the reveal only where profiling shows they dominate; keep ordinary glass styling outside the transition unchanged where possible.

Retest after each mitigation and record before/after measurements. Do not assume one cause without measurement.

#### Baseline audit (before Magic UI migration)

Measured on the home flow at a 1280×800 viewport using the installed headless Chrome binary. The home route redirected to `/vote`; the active-election API request failed with `EACCES`, so this is a UI-only baseline without live election data. Across two toggle samples, the click event duration was 56–104 ms and event processing time was 12.6–23.1 ms. The sampled frame interval had a 7 ms median and a 7.9–12.9 ms p95; 2–3 sampled frames exceeded 20 ms. The existing reveal element remained visible for about 2.48 seconds, including its 1.2-second scale animation and exit fade. There is no View Transition callback in the current implementation, so click-event processing is the comparable pre-migration measure.

The CSS audit found page-wide `body` background/color transitions of 360 ms, text-token color transitions of 360 ms, and glass-surface transitions of 280 ms. Several controls also have local transitions, and some shared utility classes use `transition-all`; these are separate from the page-wide theme transitions and should be retained only where they serve local interaction. Theme context is consumed by `ThemeControl`; the remaining `motion/react` imports in the chart and roster components are unrelated and still require the dependency. Glass surfaces use about 2 px of backdrop blur, the dashboard chart uses canvas, and the glass refraction component creates a canvas-backed texture. The audit has not established that blur or canvas snapshots cause the observed cost; profile them after the new reveal is integrated before changing those effects.

### Post-integration performance check

Measured with system Chrome (headless, 1280×800, reduced motion off) on the `/thanks` and `/vote` routes. Frame deltas were collected while the Magic UI View Transition was active:

| Route | Frames sampled | Median | p95 | Frames over 20 ms | At or below 16.67 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/thanks` | 50 | 6.9 ms | 14.0 ms | 2 | 96.0% |
| `/vote` | 75 | 6.9 ms | 7.1 ms | 1 | 98.7% |

Both representative routes average close to the 60 fps frame budget. These are headless measurements and should be treated as a repeatable smoke measurement, not a guarantee for slower devices or every dashboard snapshot.

### Keep theme tokens independent from business state

Continue using root theme classes and semantic CSS custom properties for surfaces, text, borders, and shadows. Theme updates must not reset or recreate voting, candidate, authentication, election, or result state. Avoid global color transitions during the reveal; the View Transition itself presents the new theme.

### Alternatives considered

- **Handwritten View Transition and WAAPI handler:** provides low-level control over origin and easing, but duplicates the ready-made component's reveal, locking, fallback, and synchronization behavior. It is not selected because the project will use Magic UI's component.
- **Crossfade:** simple and broadly familiar, but it snapshots and blends the full page and may leave both old and new glass surfaces compositing at once. It does not provide the requested circular reveal.
- **Wipe:** exposes a rectangular or directional edge instead of spreading from the control.
- **CSS color transitions:** easy to add, but many simultaneous property transitions compete with View Transition snapshots and increase per-frame style/paint work. They are not the default for page-wide theme changes.

## Risks / Trade-offs

- [The generated Magic UI component is copied into the project and can drift from upstream] → Keep its transition logic unmodified; limit local changes to integration props and styling, and review upstream updates when upgrading.
- [A zero-duration View Transition may still create a brief browser transition lifecycle] → Verify the reduced-motion path on supported browsers and use the component's immediate path when View Transitions are unavailable.
- [A theme-dependent icon can render before the client knows the effective theme] → Render the control only after mount and reserve its dimensions.
- [Replacing the custom hook can break existing consumers] → Update all imports in the same implementation change and document the `next-themes` hook as the replacement.
- [View Transition snapshots can still be expensive on pages with heavy blur or canvas content] → Profile representative pages and reduce only the effects shown to dominate the snapshot.

## Migration Plan

1. Profile the existing reveal and audit global transitions, theme subscriptions, and expensive snapshot surfaces; record findings and baseline measurements.
2. Add `next-themes`, configure the root provider, and migrate all theme consumers from the custom API.
3. Add Magic UI's component with the provided shadcn CLI command; connect its controlled props to `resolvedTheme` and `setTheme`.
4. Configure the circular reveal duration, reduced-motion duration, default View Transition CSS, and Next.js hydration safeguards; remove the handwritten reveal implementation.
5. Manually verify browser support, reduced motion, repeated input, saved/system theme behavior, and frame performance.

To roll back, restore the previous provider and theme toggle as a coordinated change, remove the Magic UI component integration and View Transition rules, and keep the semantic CSS theme tokens.
