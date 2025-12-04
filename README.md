# PG-BusinessFlow-AI Autonomous Governance System

This monorepo contains the source code for the various AI Ministries and supporting libraries that form the Autonomous Governance System.

## Structure

- `services/`: Contains individual microservices (AI Ministries)
- `libs/`: Contains shared libraries and SDKs
- `infra/`: Contains Infrastructure as Code (Terraform) and CI/CD configurations
- `.devcontainer/`: Development container configurations

## Getting Started

More detailed instructions will be provided as each ministry is developed.

## Frontend Testing Dashboard

A static CEO dashboard lives in `testing-ui/` and targets the Property AI service for manual verification. It uses React + Tailwind via browser modules so no install is required.

1. Start the Property AI service (`npm run start:dev:property-ai`).
2. `cd testing-ui` and run `python3 -m http.server 4173`.
3. Open `http://localhost:4173` and follow the UI prompts.

See `testing-ui/README.md` for configuration tips (API base URL, duplicate-check form, delete flows, service cards).
