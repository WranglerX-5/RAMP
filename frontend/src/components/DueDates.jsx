import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DueDates() {
  const [dueDates, setDueDates] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    aircraft_id: '',
    description: '',
    due_date: '',
    interval_hours: '',
    last_completed: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const acResponse = await fetch('/api/aircraft');
      if (acResponse.ok) {
        const acData = await acResponse.json();
        setAircraft(acData);
        if (acData.length > 0) {
          setFormData(prev => ({ ...prev, aircraft_id: acData[0].id }));
        }
      }
      await loadDueDates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDueDates = async () => {
    try {
      const response = await fetch('/api/due-dates');
      if (!response.ok) throw new Error('Failed to load due dates');
      const data = await response.json();
      setDueDates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddDueDate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/due-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interval_hours: formData.interval_hours ? parseFloat(formData.interval_hours) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add due date');

      setFormData({
        aircraft_id: formData.aircraft_id,
        description: '',
        due_date: '',
        interval_hours: '',
        last_completed: '',
      });
      setShowForm(false);
      await loadDueDates();
    } catch (err) {
      setError(err.message);
    }
  };

  const overdueItems = dueDates.filter(dd => dd.is_overdue);
  const dueItems = dueDates.filter(dd => !dd.is_overdue && dd.days_until_due <= 7);

  if (loading) return <div className="loading">Loading due dates...</div>;

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Due Dates & Alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Due Date'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {overdueItems.length > 0 && (
        <div className="alert-banner overdue">
          <strong>⚠️ {overdueItems.length} OVERDUE ITEM{overdueItems.length !== 1 ? 'S' : ''}</strong>
          <p>Immediate attention required</p>
        </div>
      )}

      {dueItems.length > 0 && (
        <div className="alert-banner due-soon">
          <strong>📅 {dueItems.length} Due within 7 days</strong>
          <p>Plan maintenance soon</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddDueDate} className="form-card">
          <h3>Add Due Date</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Aircraft</label>
              <select
                value={formData.aircraft_id}
                onChange={(e) => setFormData({ ...formData, aircraft_id: e.target.value })}
                required
              >
                {aircraft.map(ac => (
                  <option key={ac.id} value={ac.id}>
                    {ac.tail_number} - {ac.make} {ac.model}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Annual Inspection"
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Interval Hours (optional)</label>
              <input
                type="number"
                step="0.1"
                value={formData.interval_hours}
                onChange={(e) => setFormData({ ...formData, interval_hours: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="form-group">
              <label>Last Completed</label>
              <input
                type="date"
                value={formData.last_completed}
                onChange={(e) => setFormData({ ...formData, last_completed: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Due Date</button>
        </form>
      )}

      {dueDates.length === 0 ? (
        <div className="empty-state">
          <p>No due dates scheduled yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Aircraft</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Days</th>
            </tr>
          </thead>
          <tbody>
            {dueDates.map((dd) => {
              let statusBadge = 'ok';
              let statusLabel = 'OK';
              if (dd.is_overdue) {
                statusBadge = 'overdue';
                statusLabel = 'OVERDUE';
              } else if (dd.days_until_due <= 7) {
                statusBadge = 'due-soon';
                statusLabel = 'DUE SOON';
              }

              return (
                <tr key={dd.id}>
                  <td className="tail-number"><strong>{dd.aircrafts?.tail_number || 'N/A'}</strong></td>
                  <td>{dd.description}</td>
                  <td>{new Date(dd.due_date).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${statusBadge}`}>{statusLabel}</span></td>
                  <td className="days">{Math.abs(dd.days_until_due)} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
