# DSA Chatbot

This repository is a TypeScript/TanStack Start application. It does not have a Python application entry point.

## Run locally

From this directory:

```powershell
npm install
npm run dev
```

The development server opens on the port reported by Vite, normally `http://localhost:8080/`.

## Environment

Copy `.env.example` to `.env` and provide the required provider credentials locally:

- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY` (optional fallback)

Never commit `.env` or provider credentials.

## Verification

```powershell
npm run build
npm run lint
```

The root-level `github.py` file is not part of this application. It is a Git automation helper and should not be run as the app entry point.
