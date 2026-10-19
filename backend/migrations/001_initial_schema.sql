-- RAMP Initial Schema
-- Run this in Supabase SQL editor to set up the database

-- Aircraft Registry Table
CREATE TABLE aircrafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  serial TEXT NOT NULL,
  year_manufactured INTEGER,
  hours_total NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs Table
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircrafts(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  hours_logged NUMERIC(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenditures Table
CREATE TABLE expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircrafts(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL, -- e.g., "Parts", "Labor", "Inspection", "Fuel"
  description TEXT NOT NULL,
  cost NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Due Dates / Maintenance Schedule Table
CREATE TABLE due_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircrafts(id) ON DELETE CASCADE,
  description TEXT NOT NULL, -- e.g., "Annual Inspection", "100-Hour Check"
  due_date DATE NOT NULL,
  interval_hours INTEGER, -- if repeating every N hours
  last_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_maintenance_logs_aircraft_id ON maintenance_logs(aircraft_id);
CREATE INDEX idx_maintenance_logs_log_date ON maintenance_logs(log_date);
CREATE INDEX idx_expenditures_aircraft_id ON expenditures(aircraft_id);
CREATE INDEX idx_expenditures_expense_date ON expenditures(expense_date);
CREATE INDEX idx_due_dates_aircraft_id ON due_dates(aircraft_id);
CREATE INDEX idx_due_dates_due_date ON due_dates(due_date);

-- Enable RLS (Row Level Security) for future multi-tenant support
ALTER TABLE aircrafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_dates ENABLE ROW LEVEL SECURITY;

-- For MVP, allow all authenticated users to read/write (will restrict later)
CREATE POLICY "Allow all authenticated users to read aircrafts"
  ON aircrafts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to insert aircrafts"
  ON aircrafts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update aircrafts"
  ON aircrafts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Allow all authenticated users" ON maintenance_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON expenditures FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users" ON due_dates FOR ALL USING (auth.role() = 'authenticated');
