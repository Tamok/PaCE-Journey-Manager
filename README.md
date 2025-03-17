# PaCE Journey Manager

PaCE Journey Manager is a production‑ready, modular JavaScript application that displays a timeline of journeys with real‑time updates using Firebase Firestore. It supports nested sub‑journeys (each with its own collapsible Gantt chart and tasks), drag‑and‑drop reordering, editable priorities and links, and more. The app is designed to be hosted as a static site and easily embedded into your Drupal website. All updates are shared in real time across users.

## Folder Structure

PaCE-Journey-Manager/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── firebase-config.js           // Firebase config & initialization (ES module)
│   ├── defaultData.js               // Default journey data (exported as module)
│   ├── db.js                        // Firestore database layer (load, save, init)
│   ├── gantt.js                     // Functions to render Gantt charts (module)
│   └── app.js                       // Main application logic (module)
├── .gitignore
└── README.md

## Setup Instructions

### 1. Firebase Setup (Free Tier)
- **Create a Firebase Project:**  
  Visit [Firebase Console](https://console.firebase.google.com/) and create a new project.
- **Enable Firestore:**  
  In Firebase project, enable the Firestore Database.
- **Obtain Firebase Config:**  
  In project settings (click the gear icon near "Project Overview"), go to the "Your apps" section. Add a web app (if needed) and copy the configuration snippet.
- **Configure Firebase:**  
  Copy `js/firebase-config-template.js` to `js/firebase-config.js` (this file is ignored by Git) and replace the placeholder values with Firebase config.

### 2. Hosting Options
- **Static Hosting on Drupal:**  
  Copy the entire `PaCE-Journey-Manager/` folder into Drupal webroot (e.g., `drupal-root/PaCE-Journey-Manager/`).  
  Link to `index.html` or embed it via an iframe on Drupal site.
- **Firebase Hosting (Optional):**  
  Use Firebase Hosting to serve this app.

### 3. Initialization & Usage
- When the app first runs, it checks Firestore for journey data. If none is found, it loads default data from `defaultData.js`.
- The timeline shows top‑level journeys as circular bubbles. Sub‑journeys are nested under their parent in the details view.
- Clicking a timeline bubble shows detailed information, including a Gantt chart for tasks/approvals. Each sub‑journey has its own collapsible Gantt chart.
- You can add, edit, re‑order (via drag‑and‑drop), and mark journeys (or sub‑journeys) as complete. Adding a sub‑journey to a completed parent reopens it.
- Changes are saved to Firestore and are visible in real time to all users.
- Use the Save and Download buttons to manage your configuration.

### 4. Logging & Debugging
- Open your browser’s console to view log messages (initialization, data loading, saving, etc.).

Enjoy using PaCE Journey Manager!
