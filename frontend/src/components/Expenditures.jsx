import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Expenditures() {
  const [expenditures, setExpenditures] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [formData, setFormData] = useState({
    aircraft_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Parts',
    description: '',
    cost: '',
  });

  const categories = ['Parts', 'Labor', 'Inspection', 'Fuel', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadExpenditures();
  }, [filterAircraftId]);

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
      await loadExpenditures();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenditures = async () => {
    try {
      let url = '/api/expenditures';
      if (filterAircraftId) url += `?aircraft_id=${filterAircraftId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load expenditures');
      const data = await response.json();
      setExpenditures(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddExpenditure = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/expenditures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cost: parseFloat(formData.cost),
        }),
      });

      if (!response.ok) throw new Error('Failed to add expenditure');

      setFormData({
        aircraft_id: formData.aircraft_id,
        expense_date: new Date().toISOString().split('T')[0],
        category: 'Parts',
        description: '',
        cost: '',
      });
      setShowForm(false);
      await loadExpenditures();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalCost = expenditures.reduce((sum, exp) => sum + exp.cost, 0);

  if (loading) return <div className="loading">Loading expenditures...</div>;

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Expenditures</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="total-display">
        <h3>Total Expenses</h3>
        <p className="total-amount">${totalCost.toFixed(2)}</p>
      </div>

      {showForm && (
        <form onSubmit={handleAddExpenditure} className="form-card">
          <h3>Log Expenditure</h3>
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
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Oil and filter"
                required
              />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="45.50"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Expense</button>
        </form>
      )}

      <div className="filters">
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

      {expenditures.length === 0 ? (
        <div className="empty-state">
          <p>No expenditures logged yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Aircraft</th>
              <th>Category</th>
              <th>Description</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {expenditures.map((exp) => (
              <tr key={exp.id}>
                <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                <td className="tail-number"><strong>{exp.aircrafts?.tail_number || 'N/A'}</strong></td>
                <td>{exp.category}</td>
                <td>{exp.description}</td>
                <td className="cost-amount">${exp.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
