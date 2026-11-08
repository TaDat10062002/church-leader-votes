# Spec Delta

## Purpose

Provides a Vietnamese and Traditional Chinese interface for voters and administrators, with a remembered language preference. It defines which generated content is localized while keeping election data supplied by users intact.

## ADDED Requirements

### Requirement: Users can select a supported interface language
The system SHALL let users choose Vietnamese (`vi`) or Traditional Chinese (`zh-TW`) from the interface.

#### Scenario: User changes the interface language
- **WHEN** a user selects a supported language
- **THEN** the currently displayed application generated content updates to that language without changing the current route

#### Scenario: No valid language preference exists
- **WHEN** a user opens the application without a saved supported language preference
- **THEN** the system displays the Vietnamese interface

### Requirement: Language preference persists across navigation and reloads
The system SHALL remember a selected supported language in a cookie and apply it on subsequent application routes and page loads.

#### Scenario: User navigates to another application route
- **WHEN** a user with a saved language preference visits another application route
- **THEN** the system displays that route in the saved language

#### Scenario: User reloads a page
- **WHEN** a user reloads a page with a saved language preference
- **THEN** the system renders the page in that language

#### Scenario: Saved preference is unsupported or malformed
- **WHEN** the language cookie does not identify a supported locale
- **THEN** the system uses Vietnamese

### Requirement: Application generated content is available in both supported languages
The system SHALL provide Vietnamese and Traditional Chinese for application generated user facing text, including page content, status and error messages, accessible names, and generated workbook labels and instructions.

#### Scenario: User views a voter or administrator flow
- **WHEN** a user views voting, ballot confirmation, administrator login, roster import, or results content
- **THEN** all application generated text in that flow is displayed in the selected language

#### Scenario: User receives an application error or status message
- **WHEN** an application action returns a user facing error or status
- **THEN** the message is displayed in the selected language

#### Scenario: User downloads the roster workbook template
- **WHEN** a user downloads the generated Excel roster template
- **THEN** its application generated sheet labels, column headings, and instructions use the selected language

### Requirement: Locale metadata and formatting match the selected language
The system SHALL expose the selected locale through the document language and use locale appropriate formatting for application generated dates, times, and numbers.

#### Scenario: Page is rendered in a selected language
- **WHEN** the system renders a page using a supported language preference
- **THEN** the document language and localized page metadata identify that language

#### Scenario: Application formats a date, time, or number
- **WHEN** a user views a formatted date, time, or number
- **THEN** the value uses conventions for the selected language

### Requirement: User supplied election content is preserved
The system SHALL NOT translate or modify candidate names or other user supplied election content when changing the interface language.

#### Scenario: User changes language while viewing election data
- **WHEN** a user changes the interface language while candidate or other user supplied election content is visible
- **THEN** the interface labels change language while that election content remains unchanged
