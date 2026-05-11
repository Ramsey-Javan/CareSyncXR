# CareSync - Project Context

## Overview
AI-powered remote healthcare platform for elderly and chronically ill patients.

**Target:** Healthcare agencies (B2B)  
**Timeline:** 3 months to pilot  
**Team:** Backend (Python/FastAPI) + Frontend (Next.js/React)

---

## Core Problem
Enable continuous care from home through:
- Health data logging (BP, glucose, weight, temp, O2)
- Remote monitoring dashboards
- Video consultations
- AI-generated summaries & insights
- Smart alerts for critical readings

**Slogan:** "Continuous healthcare beyond hospital walls"

---

## Tech Stack

### Backend
- **Framework:** Python FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy / Prisma
- **Auth:** JWT tokens
- **API Docs:** Auto-generated (FastAPI)

### Frontend  
- **Framework:** Next.js 14 + React
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **State:** React Context / Zustand

### External Services
- **Video:** Daily.co (10k min/month free)
- **AI:** OpenAI GPT-4o-mini
- **Email:** Resend/SendGrid (free tier)
- **Hosting:** Railway/Render + Vercel

### DevOps
- **Containers:** Docker
- **VCS:** GitHub
- **CI/CD:** GitHub Actions (basic)
- **Monitoring:** Sentry (free tier)

---

## Architecture

### Multi-Tenant Model
- Agencies are isolated tenants
- Each agency has: doctors, caregivers, patients
- Data isolation via agency_id foreign key

### User Roles
1. **Admin** - Agency management, user management
2. **Doctor** - View patients, consultations, approve actions
3. **Caregiver** - Log health data, schedule appointments
4. **Patient** - (Optional) View own data

### Core Modules
1. **Auth** - JWT, role-based access control
2. **Patient Management** - CRUD, relationships
3. **Health Data** - Readings, trends, photos
4. **Alerts** - Rule engine, notifications
5. **Video** - Daily.co integration
6. **AI Summaries** - Consultation & weekly reports
7. **Scheduling** - Appointments, reminders
8. **Admin** - Analytics, billing tracking

---

## Database Schema (High-Level)

```
agencies
├── users (doctors, caregivers, admins)
├── patients
    ├── health_readings
    ├── consultations
    ├── appointments
    └── alerts
```

---

## API Structure

```
/api/v1
├── /auth (login, register, refresh)
├── /users (CRUD)
├── /patients (CRUD, list by agency)
├── /readings (log, history, latest)
├── /alerts (list, acknowledge)
├── /consultations (schedule, start, complete, summary)
├── /appointments (CRUD, reminders)
└── /admin (stats, analytics)
```

---

## Week 1 Goals

### Backend (You)
- [ ] Project setup (FastAPI + PostgreSQL)
- [ ] Database schema design
- [ ] JWT auth system
- [ ] Multi-tenant setup
- [ ] User CRUD endpoints
- [ ] Docker configuration

### Frontend (Abigael)
- [ ] Next.js setup
- [ ] Tailwind + shadcn/ui
- [ ] Login/Register UI
- [ ] API client setup
- [ ] Auth state management

**Deliverable:** Working auth with role-based access

---

## Development Workflow

### Daily Routine
- Morning: Async standup (Discord/Slack)
- Code, commit, push regularly
- Evening: Update task board

### Weekly Sync
- 1-hour call every week
- Review progress
- Plan next week
- Resolve blockers

### Tools
- **Tasks:** GitHub Projects / Trello
- **Code:** GitHub repository
- **Chat:** Discord / Slack
- **Design:** Figma
- **API Test:** Postman / Insomnia

---

## Budget (MVP Phase)
- Daily.co: Free (10k min/month)
- OpenAI: ~$3-6/month
- Hosting: Free tiers
- **Total: $0-10/month**

---

## Success Metrics

### Month 1
- Auth & patient management complete
- Health logging end-to-end

### Month 2  
- Video calls working
- AI summaries generating

### Month 3
- Live pilot with 1 agency
- 20-50 patients in system

---

## Notes
- Start small, iterate fast
- Mobile-first design (caregivers use phones)
- Deploy early (Week 4)
- Don't over-engineer
- Ship features, get feedback