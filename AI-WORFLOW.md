# AI-WORKFLOW.md

# AI Workflow

This document describes how AI tools were used during the development of GridGuard AI and how their outputs were verified before being included in the project.

---

# AI Tools Used

The following AI tools were used during development.

- ChatGPT
- Claude AI (for brainstorming and documentation)

Each tool was used as a development assistant rather than as a replacement for implementation or debugging.

---

# How AI Was Used

AI was primarily used for:

- Understanding FastAPI concepts
- SQLAlchemy relationship design
- API design suggestions
- React and Next.js UI improvements
- Tailwind CSS styling
- Documentation writing
- Refactoring repetitive code
- Debugging runtime errors
- Improving code readability

AI was **not** used to generate the complete application in a single prompt.

---

# Work Completed Without AI

The following parts required manual implementation and debugging:

- Project structure
- Database schema
- PostgreSQL setup
- Fault simulation logic
- Ticket lifecycle implementation
- Frontend integration
- API testing
- Deployment on Render
- Deployment on Vercel
- End-to-end debugging
- Integration between frontend and backend

---

# Where AI Helped Most

AI significantly accelerated development in the following areas:

- Explaining unfamiliar FastAPI concepts.
- Generating boilerplate code for REST APIs.
- Designing reusable React components.
- Improving Tailwind CSS layouts.
- Writing project documentation.
- Explaining SQLAlchemy relationships and debugging ORM issues.

---

# Examples Where AI Was Wrong

## Example 1

AI suggested an API structure that did not match the project requirements.

**Problem**

The suggested endpoints mixed repair operations into a single generic endpoint.

**Resolution**

The implementation was changed to separate endpoints:

- /faults/repair/span
- /faults/repair/dt
- /faults/repair/feeder

This made the API simpler and easier to maintain.

---

## Example 2

AI generated frontend code assuming telemetry contained formatted pole codes.

**Problem**

Telemetry actually stored the database pole ID, which caused the UI to display incorrect values.

**Resolution**

The backend response was updated and the frontend was modified to display the actual pole code instead of formatting the database ID.

---

## Example 3

AI initially suggested a deployment approach that assumed both frontend and backend lived in the same local project structure.

**Problem**

The actual project was maintained in separate local folders during development.

**Resolution**

Deployment and repository management were adjusted to match the existing project organization while keeping the deployed services working correctly.

---

# How AI Output Was Verified

Every AI-generated suggestion was reviewed before being merged into the project.

Verification methods included:

- Running the application locally.
- Testing APIs using Swagger.
- Verifying database updates in PostgreSQL.
- Checking frontend behaviour after integration.
- Comparing expected and actual simulator outputs.
- Fixing issues manually when AI suggestions were incorrect.

Only verified code was retained.

---

# Estimated AI Contribution

Approximately **35–45%** of the final code was AI-assisted.

Most business logic, debugging, integration, testing, and deployment decisions were completed manually.

---

# Example Prompts

Examples of prompts used during development:

- "Design a FastAPI endpoint for telemetry ingestion."
- "Explain SQLAlchemy one-to-many relationships."
- "Improve this Next.js dashboard layout."
- "Help debug why duplicate telemetry packets are creating multiple tickets."
- "Write professional project documentation for deployment and architecture."

---

# Lessons Learned

Using AI significantly improved development speed, especially for learning unfamiliar frameworks and reducing boilerplate code.

However, AI-generated code frequently required manual correction, testing, and adaptation to fit the project's architecture. Careful verification was essential before accepting any generated solution.

The overall development process combined AI assistance with manual implementation, debugging, and validation to ensure the final application behaved as expected.