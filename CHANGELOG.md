# Changelog

All notable changes to the PaCE Journey Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-04-05
### Added
- React migration with Vite for modern development experience
- Firebase Authentication with Google Sign-In
- Whitelist enforcement for `@ucsb.edu` email domains
- Role-based access control (admin vs. reader)
- Admin console for monitoring application state
- Modular logging system with real-time log console
- Timeline component with drag-and-drop reordering
- Goal details component with Gantt chart visualization
- Sub-goals support with parent-child relationships
- Data management tools for import/export
- Snapshot system for saving application state
- Holiday calendar integration for task scheduling

### Changed
- Complete refactoring from vanilla JS to React component architecture
- Improved UI with consistent styling using Tailwind CSS
- Enhanced project structure with clear separation of concerns
- Modernized build system using Vite instead of manual script loading
- Updated task scheduling algorithms for better accuracy

### Fixed
- Login popup closing immediately due to incorrect Firebase configuration
- Timeline sorting order for priority display
- Task completion calculation when handling different task types
- Date handling issues with task scheduling across holidays

## [1.0.0] - 2024-11-01
### Added
- Initial release with vanilla JavaScript implementation
- Firebase integration for data persistence
- Basic timeline visualization
- Simple Gantt chart for task tracking
- Renamed `firebase-config-template.js` to `firebase-config.sample.js`
- Integrated Vite for development
- Added `logger.js` module for consistent logging
- Added floating log console
- Added `firebaseService.js` for Authentication
- Whitelist access control with admin and reader modes
- Contact administrator fallback view

### Changed
- Updated authentication flow in `app.js`
- Enhanced logging throughout application
- Improved file naming conventions
