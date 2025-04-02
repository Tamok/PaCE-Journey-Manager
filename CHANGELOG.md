# CHANGELOG

## [2.0.0]– Major Refactor and Feature Enhancement

### New Features & Enhancements

- **React Migration & Vite Integration:**
  - Migrated from a plain JavaScript codebase to a modern React application.
  - Set up the project using Vite for fast development and optimized builds.
  - Reorganized the project structure into clear folders for components, services, and styles.

- **Firebase Authentication:**
  - Integrated Firebase Authentication with Google Sign‑In.
  - Ensured proper popup behavior by verifying Firebase configuration and browser settings.

- **Whitelist & Admin Access:**
  - Enforced whitelist rules so that only users with emails ending in `@ucsb.edu` or any subdomain (e.g., `@subdomain.ucsb.edu`) are allowed access.
  - Designated default admin users by requiring their email to be whitelisted and start with `j_engeln@`, `lawrence.chen@`, or `kent.johnson@`.
  - All other whitelisted users are granted reader access (with limited interactivity).

- **Modular Logging:**
  - Created a reusable logger module to log events consistently across the app.
  - Implemented a floating log console accessible via a bottom‑right button for real‑time log monitoring.

- **Component & CSS Modularization:**
  - Broke down the UI into separate React components for a clean, maintainable structure.
  - Split CSS into modular files (`global.css`, `timeline.css`, `journeyDetails.css`) to keep each file under 300 lines and maintain a consistent naming convention.

### Bug Fixes

- Fixed dependency issues by updating `index.html` to load the correct entry point (`src/main.jsx` instead of the old `js/app.js`).
- Resolved an issue with the Google login popup closing immediately by verifying Firebase configuration and ensuring that popups aren’t blocked.

## [1.0.0]
### Added
- Renamed `firebase-config-template.js` to `firebase-config.sample.js` for clarity.
- Added this CHANGELOG with semantic versioning (v1.0.0 initial release).
- Integrated Vite for fast prototyping via a new `vite.config.js` file and updated build scripts.
- Added a new `logger.js` module for consistent logging across the app.
- Added a floating log console via `logConsole.js` (a vanilla JS implementation).
- Added a new `firebaseService.js` module to handle Firebase Authentication.
- Integrated Firebase Authentication and whitelist access control in `app.js` with distinct admin (full access) and reader (view‑only) modes.
- Added a fallback “contact the page administrator” view for non‑whitelisted users.

### Changed
- Updated `app.js` to observe authentication state, enforce whitelist checks, and adjust the UI accordingly.
- Inserted calls to `logEvent()` in key operations (initialization, data loading/saving, timeline reordering, etc.).
- Renamed and adjusted file names and comments for improved clarity and modularity.
