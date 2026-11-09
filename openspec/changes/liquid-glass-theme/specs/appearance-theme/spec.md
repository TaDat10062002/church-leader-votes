# Spec Delta

## Purpose

Lets users choose a light or dark appearance, follow the device setting until they make an explicit choice, and switch themes without a flash, hydration warning, or sluggish page-wide animation.

## ADDED Requirements

### Requirement: Manage and persist the effective theme
The system SHALL support light, dark, and system theme choices, use the system preference when no explicit choice is saved, and persist an explicit user choice across reloads and navigation.

#### Scenario: First visit follows the system preference
- **WHEN** a user has no saved theme choice
- **THEN** the system resolves the effective theme from the current device preference

#### Scenario: Explicit choice takes precedence
- **WHEN** a user selects light or dark and later reloads or changes the device preference
- **THEN** the system retains the saved explicit theme

### Requirement: Reveal a user-selected theme from the toggle
When a user activates the theme toggle and the browser supports View Transitions, the system SHALL reveal the new theme from the center of the toggle over approximately 500 ms.

#### Scenario: Pointer activation starts at the toggle center
- **WHEN** a user activates the theme toggle with a pointer in a browser supporting View Transitions
- **THEN** the new theme is revealed from the center of the toggle over approximately 500 ms

#### Scenario: Keyboard activation starts at the toggle center
- **WHEN** a user activates the theme toggle from the keyboard in a browser supporting View Transitions
- **THEN** the new theme is revealed from the center of the toggle over approximately 500 ms

### Requirement: Change theme immediately when reveal motion is unavailable or reduced
The system SHALL apply the selected theme immediately without a visible reveal when View Transitions are unsupported or the user requests reduced motion.

#### Scenario: Browser does not support View Transitions
- **WHEN** a user changes theme in a browser without `document.startViewTransition`
- **THEN** the selected theme takes effect immediately without animation

#### Scenario: User requests reduced motion
- **WHEN** the operating system or browser requests reduced motion
- **THEN** the selected theme takes effect without a visible reveal

### Requirement: Apply the saved theme before the first visible render
On reload, the system SHALL apply the saved theme or resolved system theme before the first visible render and SHALL NOT produce a theme flash or hydration warning.

#### Scenario: Reload with a saved dark theme
- **WHEN** a user reloads the application with dark theme saved
- **THEN** the first visible page uses dark theme without a flash or hydration warning

#### Scenario: Reload while following system theme
- **WHEN** a user reloads without an explicit choice while the device prefers dark theme
- **THEN** the first visible page uses dark theme without a flash or hydration warning

### Requirement: Keep theme animation work bounded
During a user-initiated reveal, the system SHALL animate the reveal with `clip-path` and SHALL NOT run a page-wide CSS color transition at the same time.

#### Scenario: Theme changes during a reveal
- **WHEN** a theme change is revealed
- **THEN** the reveal uses `clip-path` and page-wide color transitions do not run concurrently

### Requirement: Ignore additional activations during a reveal
The system SHALL ignore further theme-toggle activations while a View Transition is in progress and SHALL accept activations again after that transition settles.

#### Scenario: User activates the toggle repeatedly
- **WHEN** a user activates the theme toggle while a reveal is already running
- **THEN** the additional activation is ignored and the theme state remains consistent

#### Scenario: Transition has settled
- **WHEN** the active View Transition finishes or fails
- **THEN** the system accepts a subsequent theme-toggle activation

## REMOVED Requirements

### Requirement: Manage theme through a custom ThemeProvider and useTheme API
The application SHALL expose its theme state through the self-written theme provider and its `useTheme` API.

#### Scenario: Application reads the theme through the custom API
- **WHEN** an application component needs to read or change the theme
- **THEN** it uses the self-written `ThemeProvider` and `useTheme` API

**Reason**: The custom provider duplicates theme persistence and system preference handling and contributes to maintenance and initialization problems.
**Migration**: Replace it with `next-themes`, use `resolvedTheme` for the effective theme, migrate all consumers, and remove the custom provider and hook. Consumers of the old `useTheme` API must update to the `next-themes` API.
