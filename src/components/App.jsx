// src/components/App.jsx
import React, { useEffect, useState } from 'react';
import Timeline from './Timeline';
import JourneyDetails from './JourneyDetails';
import AddJourneyForm from './AddJourneyForm';
import FloatingLogConsole from './FloatingLogConsole';
import LoginPage from './LoginPage';
import ContactAdminPage from './ContactAdminPage';
import { observeAuthState, loginWithGoogle } from '../services/firebaseService';
import { subscribeToJourneys, saveJourneys } from '../services/journeyService';
import { logEvent } from '../services/logger';
import '../styles/global.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [role, setRole] = useState('reader');
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(null);
  const [journeyData, setJourneyData] = useState([]);

  useEffect(() => {
    const unsubscribe = observeAuthState((u) => {
      setUser(u);
      if (u) {
        const email = u.email.toLowerCase();
        const whitelistRegex = /@(?:[\w-]+\.)?ucsb\.edu$/;
        if (whitelistRegex.test(email)) {
          setIsWhitelisted(true);
          // Compute role locally
          const computedRole =
            email.startsWith("j_engeln@") ||
            email.startsWith("lawrence.chen@") ||
            email.startsWith("kent.johnson@")
              ? "admin"
              : "reader";
          setRole(computedRole);
          logEvent("INFO", `User ${u.email} authenticated as ${computedRole}.`);
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
  

  // Realtime subscription to journeys
  useEffect(() => {
    const unsubscribeJourneys = subscribeToJourneys((data) => {
      setJourneyData(data);
      logEvent("INFO", "Realtime journey data updated.");
    });
    return () => unsubscribeJourneys();
  }, []);

  const persistJourneyData = async (data) => {
    setJourneyData(data);
    await saveJourneys(data);
    logEvent("INFO", "Journey data saved to cloud.");
  };

  const handleReorder = (fromIndex, toIndex) => {
    const updated = [...journeyData];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    persistJourneyData(updated);
    logEvent("INFO", `Reordered journey "${moved.title}" from index ${fromIndex} to ${toIndex}.`);
  };

  const handleAddJourney = (newJourney) => {
    const updated = [...journeyData, newJourney];
    persistJourneyData(updated);
    logEvent("INFO", `Added new journey: "${newJourney.title}".`);
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
          setJourneyData={persistJourneyData}
          role={role}
        />
      )}
      <FloatingLogConsole />
    </div>
  );
};

export default App;
