import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MaintenanceLogs() {
  const [logs, setLogs] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [formData, setFormData] = useState({
    aircraft_id: '',
    log_date: new Date().toISOString().split('T')[0],
    hours_logged: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [searchTerm, filterAircraftId]);

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
      await loadLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      let url = '/api/maintenance-logs';
      const params = [];
      if (filterAircraftId) params.push(`aircraft_id=${filterAircraftId}`);
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (params.length > 0) url += '?' + params.join('&');

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/maintenance-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours_logged: parseFloat(formData.hours_logged),
        }),
      });

      if (!response.ok) throw new Error('Failed to add log');

      setFormData({
        aircraft_id: formData.aircraft_id,
        log_date: new Date().toISOString().split('T')[0],
        hours_logged: '',
        description: '',
        notes: '',
      });
      setShowForm(false);
      await loadLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Maintenance Logs</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Log Entry'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <form onSubmit={handleAddLog} className="form-card">
          <h3>Log Maintenance Entry</h3>
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
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.log_date}
                onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Hours Logged</label>
              <input
                type="number"
                step="0.1"
                value={formData.hours_logged}
                onChange={(e) => setFormData({ ...formData, hours_logged: e.target.value })}
                placeholder="2.5"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Oil change and inspection"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional observations"
                rows="3"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Log Entry</button>
        </form>
      )}

      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search descriptions, notes, or tail number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterAircraftId}
            onChange={(e) => setFilterAircraftId(e.target.value)}
          >
            <option value="">All Aircraft</option>
            {aircraft.map(ac => (
              <option key={ac.id} value={ac.id}>
                {ac.tail_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No maintenance logs yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Aircraft</th>
              <th>Hours</th>
              <th>Description</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.log_date).toLocaleDateString()}</td>
                <td className="tail-number"><strong>{log.aircrafts?.tail_number || 'N/A'}</strong></td>
                <td className="hours">{log.hours_logged.toFixed(1)}</td>
                <td>{log.description}</td>
                <td>{log.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
