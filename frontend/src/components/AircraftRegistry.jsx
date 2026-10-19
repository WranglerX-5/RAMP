import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AircraftRegistry() {
  const [aircraft, setAircraft] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tail_number: '',
    make: '',
    model: '',
    serial: '',
    year_manufactured: new Date().getFullYear(),
    hours_total: 0,
  });

  useEffect(() => {
    loadAircraft();
  }, []);

  const loadAircraft = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/aircraft');
      if (!response.ok) throw new Error('Failed to load aircraft');
      const data = await response.json();
      setAircraft(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAircraft = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/aircraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add aircraft');
      
      setFormData({
        tail_number: '',
        make: '',
        model: '',
        serial: '',
        year_manufactured: new Date().getFullYear(),
        hours_total: 0,
      });
      setShowForm(false);
      await loadAircraft();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading aircraft...</div>;

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Aircraft Registry</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Aircraft'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <form onSubmit={handleAddAircraft} className="form-card">
          <h3>Add New Aircraft</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Tail Number</label>
              <input
                type="text"
                value={formData.tail_number}
                onChange={(e) => setFormData({ ...formData, tail_number: e.target.value })}
                placeholder="N12345"
                required
              />
            </div>
            <div className="form-group">
              <label>Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Cessna"
                required
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="172"
                required
              />
            </div>
            <div className="form-group">
              <label>Serial</label>
              <input
                type="text"
                value={formData.serial}
                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                placeholder="ABC123"
                required
              />
            </div>
            <div className="form-group">
              <label>Year Manufactured</label>
              <input
                type="number"
                value={formData.year_manufactured}
                onChange={(e) => setFormData({ ...formData, year_manufactured: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Hours</label>
              <input
                type="number"
                step="0.1"
                value={formData.hours_total}
                onChange={(e) => setFormData({ ...formData, hours_total: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Aircraft</button>
        </form>
      )}

      {aircraft.length === 0 ? (
        <div className="empty-state">
          <p>No aircraft registered yet. Add one to get started!</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tail #</th>
              <th>Make/Model</th>
              <th>Serial</th>
              <th>Year</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((ac) => (
              <tr key={ac.id}>
                <td className="tail-number"><strong>{ac.tail_number}</strong></td>
                <td>{ac.make} {ac.model}</td>
                <td>{ac.serial}</td>
                <td>{ac.year_manufactured}</td>
                <td className="hours">{ac.hours_total.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
