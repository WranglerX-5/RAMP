# RAMP — Rotor Adventures Maintenance Platform

Aircraft maintenance logbook web app for Rotor Adventures LLC.

## Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (Netlify Functions)
- **Database:** Supabase PostgreSQL (free tier, 500MB)
- **Auth:** Supabase Auth (passwordless email/magic links)
- **Domain:** maintenance.rotoradventures.xyz (subdomain, Netlify)

## V1 Features (MVP)
- Aircraft registry (tail number, make/model, serial, etc.)
- Maintenance log entry form (date, hours, description, notes)
- Expenditure tracking (parts, labor, cost)
- Due-date and overdue alerts
- Searchable maintenance history

## V2+ (Deferred)
- PDF export of logs
- Offline sync
- Digital signatures / document attachment
- Multi-user access control
- Aircraft scheduling

## Getting Started
See SETUP.md for development and deployment instructions.
