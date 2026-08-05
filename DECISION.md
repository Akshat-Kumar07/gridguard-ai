# DECISIONS.md

# GridGuard AI - Design Decisions

This document records the major architectural and implementation decisions made during development. Decisions are listed from newest to oldest.

---

# 1. Separate Repair Endpoints

## Decision

Implemented separate repair APIs for:

- Span Repair
- Distribution Transformer Repair
- Feeder Repair

```
POST /faults/repair/span
POST /faults/repair/dt
POST /faults/repair/feeder
```

## Rejected Alternative

A single repair endpoint that accepted multiple request types.

## Reason

Separate endpoints simplify validation, reduce ambiguity, and make both the frontend and API documentation easier to understand.

---

# 2. Rule-Based Fault Localization

## Decision

Fault localization is implemented using deterministic rules based on network topology and telemetry.

## Rejected Alternative

Machine learning based fault classification.

## Reason

The assessment focuses on correctness and explainability. A deterministic approach provides predictable behaviour and is easier to debug without requiring historical training data.

---

# 3. Radial Network Representation

## Decision

Represented the electrical network as:

```
Feeder
    ↓
Transformer
    ↓
Pole
```

## Rejected Alternative

General graph representation.

## Reason

The simulated distribution network is radial, making a tree structure simpler and more efficient for localization and traversal.

---

# 4. PostgreSQL as the Primary Database

## Decision

Used PostgreSQL for storing all operational data.

## Rejected Alternative

SQLite and MongoDB.

## Reason

PostgreSQL provides strong relational modelling and fits the hierarchical relationships between feeders, transformers, poles, telemetry, and tickets.

---

# 5. FastAPI for Backend

## Decision

Used FastAPI to build REST APIs.

## Rejected Alternative

Flask and Django.

## Reason

FastAPI provides automatic Swagger documentation, request validation with Pydantic, and excellent performance with minimal boilerplate.

---

# 6. Next.js for Frontend

## Decision

Built the operator dashboard using Next.js and React.

## Rejected Alternative

Plain React (CRA).

## Reason

Next.js provides a better project structure, routing, and deployment experience.

---

# 7. Automatic Ticket Creation

## Decision

Tickets are automatically generated when a valid power loss event is detected.

## Rejected Alternative

Manual ticket creation.

## Reason

Automatic ticket generation reduces operator workload and reflects how modern outage management systems operate.

---

# 8. Automatic Ticket Closure

## Decision

Tickets are automatically closed after receiving valid power restoration telemetry.

## Rejected Alternative

Manual ticket closure.

## Reason

This keeps ticket status synchronized with the actual network state and reduces manual intervention.

---

# 9. Telemetry Validation Before Processing

## Decision

Every telemetry packet is validated before fault detection.

Validation includes:

- Duplicate sequence detection
- Out-of-order packet detection
- Unknown pole rejection

## Rejected Alternative

Directly storing every packet.

## Reason

Filtering invalid telemetry prevents false alarms and duplicate tickets.

---

# 10. REST API Architecture

## Decision

Communication between frontend and backend uses REST APIs.

## Rejected Alternative

WebSockets.

## Reason

REST is sufficient for the current simulator and simpler to deploy on free hosting platforms.

---

# Assumptions

The following assumptions were made because the assessment specification leaves them open.

- Every pole belongs to exactly one transformer.
- Every transformer belongs to exactly one feeder.
- The distribution network is radial.
- Pole ordering is available using `seq_on_line`.
- Telemetry packets include monotonically increasing sequence numbers.
- A valid power restoration event indicates successful repair.

---

# Known Limitations

- No GIS-based visualization.
- No real IoT devices; telemetry is simulator-generated.
- Network topology is static.
- Simultaneous complex outages may reduce localization confidence.
- Authentication and authorization are not implemented.

---

# What I Would Improve With Two More Weeks

- Dockerize the complete application for one-command deployment.
- Add an interactive network topology visualization.
- Introduce MQTT-based telemetry ingestion.
- Improve localization confidence using historical telemetry.
- Add authentication and role-based access control.
- Build automated unit tests for the localization engine.
- Add notifications via email or SMS.

---

# Current Fragile Areas

- Local deployment currently requires backend and frontend to be started separately.
- Render free tier introduces cold-start delays.
- Localization assumes a radial topology and complete network metadata.
- Some deployment and environment configuration steps are still manual and could be automated.