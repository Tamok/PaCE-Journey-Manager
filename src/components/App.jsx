// src/components/App.jsx
import React, { useEffect, useState } from 'react';
import Timeline from './Timeline';
import JourneyDetails from './JourneyDetails';
import AddJourneyForm from './AddJourneyForm';
import FloatingLogConsole from './FloatingLogConsole';
import LoginPage from './LoginPage';
import ContactAdminPage from './ContactAdminPage';
import { observeAuthState, loginWithGoogle } from '../services/firebaseService';
import { logEvent } from '../services/logger';
import '../styles/global.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [role, setRole] = useState('reader'); // 'admin' or 'reader'
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(null);
  const [journeyData, setJourneyData] = useState([]); // initially empty; could load from Firestore here

  // Simulate fetching default journey data (replace with Firestore calls in production)
  useEffect(() => {
    // For demo purposes, initialize with a couple of sample journeys.
    const sampleData = [
      {
        id: 'journey-1',
        title: 'Project Management',
        priority: 'Critical',
        difficulty: 'Easy',
        note: 'Initial journey',
        scheduledStartDate: '2025-03-03',
        completedDate: null,
        subJourneys: []
      },
      {
        id: 'journey-2',
        title: 'International Programs',
        priority: 'Important',
        difficulty: 'Hard',
        note: 'Requires coordination',
        scheduledStartDate: '2025-04-01',
        completedDate: null,
        subJourneys: []
      }
    ];
    setJourneyData(sampleData);
    logEvent('INFO', 'Default journey data loaded.');
  }, []);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = observeAuthState((u) => {
      setUser(u);
      if (u) {
        const email = u.email.toLowerCase();
        // Whitelist: allow emails ending in @ucsb.edu or any subdomain (e.g., @subdomain.ucsb.edu)
        const whitelistRegex = /@(?:[\w-]+\.)?ucsb\.edu$/;
        if (whitelistRegex.test(email)) {
          setIsWhitelisted(true);
          // For admin, the email must both be whitelisted and start with one of the specified prefixes
          if (
            (email.startsWith("j_engeln@") ||
              email.startsWith("lawrence.chen@") ||
              email.startsWith("kent.johnson@"))
          ) {
            setRole("admin");
          } else {
            setRole("reader");
          }
          logEvent(
            "INFO",
            `User ${u.email} authenticated as ${role === "admin" ? "admin" : "reader"}.`
          );
        } else {
          setIsWhitelisted(false);
          logEvent("WARN", `User ${u.email} is not whitelisted.`);
        }
      } else {
        setIsWhitelisted(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handler for reordering journeys (admin only)
  const handleReorder = (fromIndex, toIndex) => {
    const updated = [...journeyData];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setJourneyData(updated);
    logEvent('INFO', `Reordered journey "${moved.title}" from index ${fromIndex} to ${toIndex}.`);
  };

  // Handler for adding a new journey
  const handleAddJourney = (newJourney) => {
    setJourneyData(prev => [...prev, newJourney]);
    logEvent('INFO', `Added new journey: "${newJourney.title}".`);
  };

  if (!user) {
    return <LoginPage onLogin={loginWithGoogle} />;
  }
  if (!isWhitelisted) {
    return <ContactAdminPage />;
  }

  return (
    <div className="app-container">
      <h1>PaCE Journey Manager</h1>
      <AddJourneyForm onAddJourney={handleAddJourney} role={role} />
      <Timeline
        journeyData={journeyData}
        onSelectJourney={setSelectedJourneyIndex}
        role={role}
        onReorder={handleReorder}
      />
      {selectedJourneyIndex !== null && (
        <JourneyDetails
          journey={journeyData[selectedJourneyIndex]}
          journeyData={journeyData}
          setJourneyData={setJourneyData}
          role={role}
        />
      )}
      <FloatingLogConsole />
    </div>
  );
};

export default App;
