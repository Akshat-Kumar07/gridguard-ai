# Propel GridGuard AI

> AI-powered Smart Grid Fault Detection, Localization & Incident Management Platform

GridGuard AI is a full-stack smart grid monitoring platform that simulates an electricity distribution network and automatically detects, localizes, and manages power outages using real-time telemetry from pole devices.

The system models **Feeders → Distribution Transformers (DTs) → Poles**, continuously monitors telemetry, detects faults, creates maintenance tickets, and provides operators with a live dashboard for monitoring and recovery.

---

# 🌐 Live Demo

## Frontend
https://gridguard-ai-five.vercel.app

## Backend API
https://gridguard-ai-18s4.onrender.com

## Swagger API
https://gridguard-ai-18s4.onrender.com/docs

> **Note:** The backend is hosted on Render Free Tier. The first request may take 30–60 seconds due to cold start.

---

# 🎥 Demo Video

**Video Link:** https://drive.google.com/file/d/1taC7Z3OdGFBk1XUxxKNoSdT6qgRdD6X4/view?usp=sharing

---

# 📸 Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Live Faults

![Live Faults](screenshots/live-faults.png)

## Telemetry

![Telemetry](screenshots/telemetry.png)

## Tickets

![Tickets](screenshots/tickets.png)

## Fault Simulator

![Fault Simulator](screenshots/simulator.png)


# ✨ Key Features

## Real-time Monitoring

- Live telemetry ingestion
- Device heartbeat monitoring
- Battery & RSSI monitoring
- Firmware tracking
- Pole energization status

---

## AI Fault Detection

- Automatic power outage detection
- Fault localization
- Span fault detection
- Distribution Transformer fault detection
- Feeder fault detection
- Duplicate fault prevention
- Confidence-based localization

---

## Incident Management

- Automatic ticket generation
- Ticket lifecycle management
- Ticket acknowledgment
- Crew assignment
- Resolution & auto verification

---

## Fault Simulator

Supports complete testing without physical hardware.

### Fault Injection

- Span Fault
- Distribution Transformer Fault
- Feeder Fault
- Noise Injection

### Repair Simulation

- Span Repair
- Distribution Transformer Repair
- Feeder Repair

---

## Dashboard

Displays

- Total Feeders
- Total Transformers
- Total Poles
- Active Faults
- Open Tickets
- Grid Health
- Backend Status

---

## Scheduled Outages

Supports planned maintenance by preventing false fault tickets during scheduled power shutdowns.

---

# 🏗 System Architecture

```
            Smart Pole Devices
                    │
                    ▼
          Telemetry REST API (FastAPI)
                    │
                    ▼
        Telemetry Validation Service
                    │
                    ▼
          Fault Detection Engine
                    │
                    ▼
        Fault Localization Engine
                    │
                    ▼
          Ticket Management Service
                    │
                    ▼
              PostgreSQL Database
                    │
                    ▼
        Next.js Operator Dashboard
```

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide Icons

---

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Alembic

---

## Database

- PostgreSQL

---

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📂 Project Structure

```
GridGuard-AI
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   ├── simulator
│   │   └── localization
│   │
│   ├── requirements.txt
│   └── alembic
│
├── src
│   ├── app
│   ├── components
│   ├── services
│   ├── hooks
│   └── types
│
├── database
├── docs
└── docker
```

---

# 🚀 Running Locally

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

## Frontend

```bash
npm install

npm run dev
```

Frontend

```
http://localhost:3000
```

---

# 🗄 Database

The application stores

- Feeders
- Distribution Transformers
- Poles
- Telemetry
- Fault Tickets
- Scheduled Outages

using PostgreSQL.

---

# 🔌 REST APIs

Major APIs
git push origin main


| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /telemetry | Receive telemetry |
| GET | /telemetry | View telemetry |
| GET | /tickets | View tickets |
| PATCH | /tickets/{id}/acknowledge | Acknowledge ticket |
| PATCH | /tickets/{id}/assign | Assign crew |
| PATCH | /tickets/{id}/resolve | Resolve ticket |
| POST | /faults/span | Inject span fault |
| POST | /faults/dt | Inject transformer fault |
| POST | /faults/feeder | Inject feeder fault |
| POST | /faults/noise | Inject telemetry noise |
| POST | /faults/repair/span | Repair span |
| POST | /faults/repair/dt | Repair transformer |
| POST | /faults/repair/feeder | Repair feeder |

---

# 🧪 Testing Workflow

1. Inject a Span / DT / Feeder fault.
2. Observe telemetry updates.
3. Verify ticket creation.
4. Repair the affected component.
5. Confirm automatic ticket closure.
6. Validate dashboard updates.

---

# 📄 Repository Documents

- README.md
- ARCHITECTURE.md
- DEPLOYMENT.md
- DECISIONS.md
- AI-WORKFLOW.md

---

# 🚀 Future Improvements

- GIS Map Visualization
- Predictive Maintenance using Machine Learning
- IoT MQTT Integration
- SMS & Email Alerts
- Authentication & Role-based Access Control
- Network Topology Visualization
- Analytics Dashboard
- Historical Fault Trends

---

# 👨‍💻 Author

**Akshat Kumar**

Email:
kumarakshat1001@gmail.com

GitHub:
https://github.com/Akshat-Kumar07

---

# 📜 License

This project was developed as part of the **Propel GridGuard AI Technical Assessment**.
>>>>>>> e4d2b78 (Add project documentation and telemetry improvements)
