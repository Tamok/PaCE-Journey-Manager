# PaCE Journey Manager

PaCE Journey Manager is a React-based web application that helps track and manage project journeys with an interactive timeline interface. Built for the Professional and Continuing Education (PaCE) department at UCSB, it provides visual goal tracking with Gantt charts, real-time updates using Firebase, and role-based access control.

## Features

- **Interactive Timeline**: Visual representation of goals sorted by priority
- **Gantt Charts**: Detailed task scheduling and progress visualization
- **Role-Based Access Control**: Admin and reader roles with appropriate permissions
- **Real-time Updates**: Changes are instantly visible to all users
- **Sub-goals**: Hierarchical goal organization with parent-child relationships
- **Firebase Integration**: Authentication and data persistence
- **Holiday Calendar**: Automatic scheduling adjustment around holidays
- **Data Management**: Import/export functionality and snapshotting
- **Admin Console**: Monitoring application state and user activity

## Project Structure

```
PaCEJourneyManager/
├── src/
│   ├── components/     # React components
│   │   └── ui/         # Reusable UI components
│   ├── services/       # Application business logic
│   ├── styles/         # CSS modules
│   ├── constants.js    # Application constants
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── index.html          # HTML entry point
└── vite.config.mjs     # Vite configuration
```

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Firebase project with Firestore and Authentication enabled

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/PaCEJourneyManager.git
cd PaCEJourneyManager
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm
pnpm install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication with Google Sign-In
3. Enable Firestore Database
4. Create a `src/firebase-config.js` file with your Firebase credentials:

```javascript
// src/firebase-config.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Local Development

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

### 5. Build for Production

```bash
# Using npm
npm run build

# Using pnpm
pnpm build
```

## Authentication and Access Control

- Only users with emails ending in `@ucsb.edu` or any subdomain can access the application
- Admin access is granted to specific email patterns (configurable in settings)
- All other valid users receive reader (limited) access

## Data Management

### Importing Data
Use the Admin Console to import JSON-formatted goal data. The application includes validation to ensure data integrity.

### Exporting Data
Administrators can export the current application state as JSON for backup purposes.

### Snapshots
Create named snapshots to preserve application state at specific points in time. Snapshots can be restored or compared later.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- UCSB Professional and Continuing Education department
- Firebase team for the backend services
