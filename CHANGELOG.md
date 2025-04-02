# CHANGELOG

## [1.0.0] - YYYY-MM-DD
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
