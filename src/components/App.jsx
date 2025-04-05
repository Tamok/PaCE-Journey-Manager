// src/components/App.jsx
import React, { useEffect, useState } from 'react';
import AdminConsole from './AdminConsole';
import ImpersonationBanner from './ImpersonationBanner';
import Timeline from './Timeline';
import GoalDetails from './GoalDetails';
import AddGoalForm from './AddGoalForm';
import { subscribeToGoals } from '../services/goalService';
import { PRIORITY_ORDER } from '../constants';
import { auth } from '../services/firebaseService';
import { scheduleGoals } from '../services/scheduler';
import { persistGoals } from '../services/goalService';

const App = () => {
  const [goalData, setGoalData] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [impersonationMode, setImpersonationMode] = useState(false);
  const [user, setUser] = useState({ email: '', role: 'reader' });

  useEffect(() => {
    auth.onAuthStateChanged(u => {
      const email = u?.email || '';
      // Simple check for admin privileges
      const isAdmin = email.endsWith('@ucsb.edu');
      setUser({ email, role: isAdmin ? 'admin' : 'reader' });
    });

    const unsubGoals = subscribeToGoals(data => {
      // Self-sort by priority
      const sorted = [...data].sort(
        (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
      );
      setGoalData(sorted);
    });
    return unsubGoals;
  }, []);

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
  };

  // For drag-and-drop reorder
  const handleReorder = async (updatedGoals) => {
    scheduleGoals(updatedGoals);
    await persistGoals(updatedGoals);
    setGoalData([...updatedGoals]);
  };

  return (
    <div className="min-h-screen p-4 bg-primary text-white">
      {impersonationMode && <ImpersonationBanner />}
      {user.role === 'admin' && <AdminConsole setImpersonationMode={setImpersonationMode} />}

      {/* Header with hotlinked UCSB logo */}
      <header className="flex items-center mb-4">
        <a href="https://www.ucsb.edu" target="_blank" rel="noreferrer">
          <img
            src="https://www.professional.ucsb.edu/sites/default/files/PaceLogos/Thing_Plain.png"
            alt="UCSB Logo"
            className="h-12 mr-4"
          />
        </a>
        <h1 className="text-2xl text-blue-900">PaCE Journey Manager</h1>
      </header>

      {goalData.length === 0 ? (
        <p className="text-lg">No goals found. Add one to get started.</p>
      ) : (
        <>
          <Timeline
            goalData={goalData}
            onSelectGoal={handleSelectGoal}
            role={impersonationMode ? 'reader' : user.role}
            onReorder={handleReorder}
          />
          {selectedGoal && (
            <GoalDetails
              goal={selectedGoal}
              allGoals={goalData}
              role={impersonationMode ? 'reader' : user.role}
              onClose={() => setSelectedGoal(null)}
              onGoalsUpdate={setGoalData}
            />
          )}
        </>
      )}

      { !impersonationMode && user.role === 'admin' && (
        <AddGoalForm
          goals={goalData}
          setGoals={setGoalData}
          role={user.role}
        />
      )}
    </div>
  );
};

export default App;
