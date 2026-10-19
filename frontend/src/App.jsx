import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import AircraftRegistry from './components/AircraftRegistry';
import MaintenanceLogs from './components/MaintenanceLogs';
import Expenditures from './components/Expenditures';
import DueDates from './components/DueDates';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('aircraft');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading RAMP...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>✈️ RAMP</h1>
          <p className="subtitle">Aircraft Maintenance Tracker</p>
        </div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'aircraft' ? 'active' : ''}`}
          onClick={() => setActiveTab('aircraft')}
        >
          Aircraft Registry
        </button>
        <button
          className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance Logs
        </button>
        <button
          className={`tab-button ${activeTab === 'expenditures' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenditures')}
        >
          Expenditures
        </button>
        <button
          className={`tab-button ${activeTab === 'due-dates' ? 'active' : ''}`}
          onClick={() => setActiveTab('due-dates')}
        >
          Due Dates & Alerts
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'aircraft' && <AircraftRegistry />}
        {activeTab === 'maintenance' && <MaintenanceLogs />}
        {activeTab === 'expenditures' && <Expenditures />}
        {activeTab === 'due-dates' && <DueDates />}
      </main>
    </div>
  );
}
