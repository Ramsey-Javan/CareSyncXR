# CareSync Development Plan

## Overview
CareSync is an AI-assisted remote care platform for elderly and chronically ill patients. The MVP focuses on role-based access, patient management, health logging, and dashboard-driven workflows.

## Current implementation status
The frontend already includes:
- Authentication routes for login and registration
- A dashboard entry point
- Patient-related pages
- Health log, history, and photo-capture routes

## Phase 1 — Foundation
- Add a hospital-aware multi-tenant model on the backend
- Keep agency, hospital, admin, doctor, caregiver, and patient roles clearly separated
- Ensure all authentication and route guards are role-aware

## Phase 2 — Patient management
- Deliver full CRUD for patients
- Connect patients to caregivers and primary doctors
- Expose patient workflows from the dashboard for quick access

## Phase 3 — Health logging and monitoring
- Support BP, glucose, weight, temperature, oxygen, and symptoms
- Show trend graphs and history views
- Make health logging reachable from the dashboard and linked into patient records

## Phase 4 — Seamless integration
- Connect dashboard cards and overview panels to the main workflows
- Ensure navigation is consistent across patient, health, and history pages
- Keep the UI mobile-friendly for caregivers and clinicians

## Immediate next steps for this workspace
1. Connect the dashboard to real patient and health data APIs
2. Add role-based navigation and route protections
3. Expand patient detail pages with health summaries and recent entries
4. Add dashboards and charts for trend analysis
