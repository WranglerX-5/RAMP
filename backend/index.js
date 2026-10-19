import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Aircraft Registry Routes
// ============================================

// GET all aircraft
app.get('/api/aircraft', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('aircrafts')
      .select('*')
      .order('tail_number', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single aircraft by ID
app.get('/api/aircraft/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('aircrafts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new aircraft
app.post('/api/aircraft', async (req, res) => {
  try {
    const { tail_number, make, model, serial, year_manufactured, hours_total } = req.body;
    const { data, error } = await supabase
      .from('aircrafts')
      .insert([{
        tail_number,
        make,
        model,
        serial,
        year_manufactured,
        hours_total: hours_total || 0
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update aircraft
app.put('/api/aircraft/:id', async (req, res) => {
  try {
    const { tail_number, make, model, serial, year_manufactured, hours_total } = req.body;
    const { data, error } = await supabase
      .from('aircrafts')
      .update({
        tail_number,
        make,
        model,
        serial,
        year_manufactured,
        hours_total,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// Maintenance Log Routes
// ============================================

// GET maintenance logs (with optional search)
app.get('/api/maintenance-logs', async (req, res) => {
  try {
    const { aircraft_id, search } = req.query;
    let query = supabase
      .from('maintenance_logs')
      .select('*, aircrafts(tail_number)');

    if (aircraft_id) {
      query = query.eq('aircraft_id', aircraft_id);
    }

    const { data, error } = await query.order('log_date', { ascending: false });

    if (error) throw error;

    // Simple client-side search for MVP
    let filtered = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchLower) ||
        log.notes?.toLowerCase().includes(searchLower) ||
        log.aircrafts?.tail_number?.toLowerCase().includes(searchLower)
      );
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single maintenance log
app.get('/api/maintenance-logs/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*, aircrafts(tail_number)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new maintenance log entry
app.post('/api/maintenance-logs', async (req, res) => {
  try {
    const { aircraft_id, log_date, hours_logged, description, notes } = req.body;
    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert([{
        aircraft_id,
        log_date,
        hours_logged: hours_logged || 0,
        description,
        notes,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update maintenance log
app.put('/api/maintenance-logs/:id', async (req, res) => {
  try {
    const { log_date, hours_logged, description, notes } = req.body;
    const { data, error } = await supabase
      .from('maintenance_logs')
      .update({
        log_date,
        hours_logged,
        description,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// Expenditure Routes
// ============================================

// GET expenditures for an aircraft
app.get('/api/expenditures', async (req, res) => {
  try {
    const { aircraft_id } = req.query;
    let query = supabase
      .from('expenditures')
      .select('*, aircrafts(tail_number)');

    if (aircraft_id) {
      query = query.eq('aircraft_id', aircraft_id);
    }

    const { data, error } = await query.order('expense_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new expenditure
app.post('/api/expenditures', async (req, res) => {
  try {
    const { aircraft_id, expense_date, category, description, cost } = req.body;
    const { data, error } = await supabase
      .from('expenditures')
      .insert([{
        aircraft_id,
        expense_date,
        category,
        description,
        cost: parseFloat(cost),
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// Due Dates / Alerts Routes
// ============================================

// GET due dates and overdue items
app.get('/api/due-dates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('due_dates')
      .select('*, aircrafts(tail_number)')
      .order('due_date', { ascending: true });

    if (error) throw error;

    // Mark overdue items
    const now = new Date();
    const withStatus = (data || []).map(item => ({
      ...item,
      is_overdue: new Date(item.due_date) < now,
      days_until_due: Math.ceil((new Date(item.due_date) - now) / (1000 * 60 * 60 * 24))
    }));

    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new due date
app.post('/api/due-dates', async (req, res) => {
  try {
    const { aircraft_id, description, due_date, interval_hours, last_completed } = req.body;
    const { data, error } = await supabase
      .from('due_dates')
      .insert([{
        aircraft_id,
        description,
        due_date,
        interval_hours: interval_hours || null,
        last_completed: last_completed || null,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`RAMP API running on port ${PORT}`);
});
