# AlgoVision Backend (Legacy Express Server)

This `backend/` folder contains a legacy Express server for AlgoVision.

## Overview

- The backend is a standalone legacy Express server.
- The frontend currently uses its own server functions built with TanStack Start in `frontend/src/lib/`.
- The backend is not required for the primary frontend flow.
- It can be used as an alternative API when deploying the frontend as a static site without SSR.

## Run

From the `backend/` folder:

```bash
npm install
node server.js
```

## Required environment variables

Create a `.env` file in `backend/` with at least:

```env
GROQ_API_KEY=your_groq_api_key_here
```

The backend also supports:

```env
PORT=5000
NODE_ENV=development
```
