# Proposal

## Why

The existing circular theme reveal is visibly laggy, and the custom theme provider is difficult to maintain. Theme initialization can also flash the wrong appearance before the page settles, so the theme state and first render need a more reliable approach.

## What Changes

- Replace the custom theme provider with `next-themes`, configured with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, and `resolvedTheme` for the effective appearance.
- **BREAKING**: Replace the project's custom `useTheme` API with the `next-themes` API. Update all consumers and remove the old provider; callers relying on the old API must migrate.
- Add Magic UI's `AnimatedThemeToggler` with `npx shadcn@latest add @magicui/animated-theme-toggler` and use its circular View Transition reveal instead of implementing the reveal handler and `clip-path` animation by hand. Configure a 500 ms duration and connect it to `next-themes`.
- Use the component's immediate fallback when View Transitions are unavailable and configure zero-duration transitions when reduced motion is requested.
- Prevent a flash of the wrong theme and hydration warnings during initial load.
- Use the theme control and Sun/Moon icons provided by Magic UI; do not add a separate Framer Motion animation or a handwritten page transition.

## Capabilities

### New Capabilities

- `appearance-theme`: Choose and persist a light or dark appearance, follow system appearance when no explicit choice exists, and change themes with a responsive circular reveal.
- `liquid-glass-ui`: Present consistent Liquid Glass surfaces across the application, adapting them to the current appearance.

### Modified Capabilities

- None.

## Impact

- Theme state and provider integration in the root application layout and theme provider; replace custom `useTheme` imports throughout the application.
- Magic UI theme toggle integration and global theme CSS for View Transition pseudo-elements and removal or scoping of global color transitions.
- Next.js document initialization and hydration behavior in `src/app/layout.tsx`; an inline `<head>` initialization script is only relevant if the application is moved to Vite.
- Dependencies and generated component files from the Magic UI shadcn registry command, including its required icon dependency, plus `next-themes` for theme state.
- No changes to voting, administration, or API business behavior.
