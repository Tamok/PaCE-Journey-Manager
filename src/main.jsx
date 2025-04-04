// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import '../tailwind.css';
import { storeLogToFirestore } from './services/remoteLogger';
import { setRemoteLogger } from './services/logger';

setRemoteLogger(storeLogToFirestore);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
