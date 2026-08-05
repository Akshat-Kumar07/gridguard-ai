# DEPLOYMENT.md

# GridGuard AI - Deployment Guide

This document explains how to run the complete GridGuard AI system locally and how it is deployed.

---

# Prerequisites

Install the following software before starting.

| Software | Version |
|----------|----------|
| Git | Latest |
| Python | 3.11+ |
| Node.js | 20+ |
| PostgreSQL | 16 |
| Docker Desktop *(optional)* | Latest |

---

# Project Structure

```
backend/
frontend/
docker-compose.yml
README.md
```

---

# Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate it.

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the backend.

```bash
uvicorn app.main:app --reload
```

Backend will be available at

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# Frontend Setup

Navigate to frontend.

```bash
cd frontend
```

Install packages.

```bash
npm install
```

Run development server.

```bash
npm run dev
```

Frontend

```
http://localhost:3000
```

---

# Database Configuration

PostgreSQL is required.

Create a database named

```
gridguard
```

Default configuration

| Variable | Value |
|----------|--------|
| Host | localhost |
| Port | 5432 |
| Username | postgres |
| Password | postgres |
| Database | gridguard |

---

# Environment Variables

Create a `.env` file inside the backend directory.

Example

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gridguard
```

For frontend, create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

A `.env.example` file is included for reference.

---

# Verify Installation

After starting both services:

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

You should be able to:

- View the dashboard
- Open telemetry page
- Inject faults
- Create tickets
- Repair faults

---

# Deployment

## Backend

Hosted on Render

```
https://gridguard-ai-18s4.onrender.com
```

Deployment command

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Frontend

Hosted on Vercel

```
https://gridguard-ai-five.vercel.app
```

Environment Variable

```
NEXT_PUBLIC_API_URL=https://gridguard-ai-18s4.onrender.com
```

---

# Troubleshooting

## Backend does not start

**Symptom**

```
ModuleNotFoundError
```

**Solution**

Activate the virtual environment.

```bash
venv\Scripts\activate
```

Install dependencies again.

```bash
pip install -r requirements.txt
```

---

## Database connection failed

**Symptom**

```
connection refused
```

**Solution**

- Ensure PostgreSQL is running.
- Verify username/password.
- Check DATABASE_URL.

---

## Frontend cannot reach backend

**Symptom**

Dashboard keeps loading.

**Solution**

Check

```
NEXT_PUBLIC_API_URL
```

Ensure backend is running.

Verify CORS settings.

---

## Render cold start

**Symptom**

Backend takes 30–60 seconds to respond.

**Solution**

This is expected because Render Free Tier spins down inactive services.

---

## CORS Error

**Symptom**

Requests blocked by browser.

**Solution**

Verify frontend URL is added to

```python
allow_origins = [
    "http://localhost:3000",
    "https://gridguard-ai-five.vercel.app"
]
```

---

## Port already in use

**Symptom**

```
Address already in use
```

**Solution**

Stop the process using the port or change the application port.

---

## PostgreSQL Authentication Failed

**Symptom**

```
password authentication failed
```

**Solution**

Verify

- Username
- Password
- Database name

Update `.env` if necessary.

---

# Resetting the Application

To clear the database

```sql
DROP DATABASE gridguard;

CREATE DATABASE gridguard;
```

Run migrations (if applicable) and seed the synthetic network again.

---

# Public Deployment

Frontend

https://gridguard-ai-five.vercel.app

Backend

https://gridguard-ai-18s4.onrender.com

Swagger

https://gridguard-ai-18s4.onrender.com/docs

---

# Notes

- Backend is deployed on Render Free Tier.
- Frontend is deployed on Vercel.
- The first backend request may take up to one minute because of Render cold starts.
- Synthetic network data is preloaded for demonstration.