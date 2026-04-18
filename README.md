# Missing Podo: The Ankara Case

## Overview
This repository contains a staged implementation of an investigation dashboard for the Jotform frontend challenge scenario.
The product goal is to merge multiple form sources into a person-centric investigation experience.

## Commit Strategy
The project is intentionally split into focused commits instead of a single large push:
1. Foundation and secure environment setup.
2. Data engine and person mapping model.
3. Core investigation UI.
4. Map interactions and synchronization.
5. Mobile behavior and responsive architecture.
6. Error handling and resilience improvements.
7. Documentation finalization.

## Foundation Scope (Commit 1)
This first commit includes:
- Vite + React + TypeScript project setup.
- Tailwind integration.
- Strict TypeScript compiler configuration.
- Environment variable template.
- Git ignore rules to prevent local secret leakage.

## Secure Environment Setup
Create a local environment file from the template:

```bash
cp .env.example .env.local
```

Then set your key locally:

```env
VITE_JOTFORM_API_KEY=your_jotform_api_key_here
```

Important:
- Never commit `.env.local`.
- Never hardcode API keys in source files.

## Getting Started
```bash
npm install
npm run dev
```

The first commit is intentionally minimal and stable so later features can be reviewed incrementally.
