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

const App = () => {
  const [goalData, setGoalData] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [impersonationMode, setImpersonationMode] = useState(false);
  const [user, setUser] = useState({ email: '', role: 'reader' });

  useEffect(() => {
    auth.onAuthStateChanged(u => {
      setUser({ email: u?.email, role: u?.email.endsWith('@ucsb.edu') ? 'admin' : 'reader' });
    });

    const unsubGoals = subscribeToGoals(data => {
      setGoalData(data.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)));
    });
    return unsubGoals;
  }, []);

  return (
    <div className="min-h-screen p-4 bg-primary text-white">
      {impersonationMode && <ImpersonationBanner />}
      {user.role === 'admin' && <AdminConsole setImpersonationMode={setImpersonationMode} />}
      <h1 className="text-2xl mb-4">Welcome, {user.email || "Loading..."}</h1>
      {goalData.length === 0 ? (
        <p className="text-lg">No goals found in Firestore. Add one to get started.</p>
      ) : (
        <>
          <Timeline goalData={goalData} onSelectGoal={setSelectedGoal} role={impersonationMode ? 'reader' : user.role} />
          {selectedGoal && <GoalDetails goal={selectedGoal} holidays={[]} />}
        </>
      )}
      {!impersonationMode && user.role === 'admin' && <AddGoalForm />}
    </div>
  );  
};

export default App;
