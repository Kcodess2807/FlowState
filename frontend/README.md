# FlowState — Frontend

The web client for **FlowState** — practice system design problems on a canvas and
showcase your solutions. (LeetCode-for-system-design, GitHub meets Excalidraw.)

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** (teal/turquoise brand, `teal-600` / `#0d9488`)
- **Framer Motion** for transitions and reveals
- **React Router** for routing
- **@tabler/icons-react** for icons
- Hand-built shadcn-style UI primitives (`src/components/ui`)

> The pasted spec called for Next.js + NextAuth GitHub OAuth. Per the project
> decision, this was adapted to **React + Vite** with auth wired to the existing
> **FastAPI JWT** backend (email/password), not GitHub OAuth.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev            # http://localhost:5173
```

The dev server expects the FastAPI backend at `http://localhost:8000` (see
`VITE_API_BASE_URL`). Only the auth endpoints (`/auth/login`, `/auth/register`,
`/auth/me`) are live; problems/solutions/profiles use mock data in
`src/lib/mock-data.ts`. Real endpoints are marked with `// TODO` in
`src/lib/api.ts`.

### Backend CORS

The FastAPI app does not yet enable CORS. For the browser to call it, add
`CORSMiddleware` allowing `http://localhost:5173` in `backend/app/main.py`.

## Pages

| Route | Page |
| --- | --- |
| `/` | Landing |
| `/problems` | Problem set with filters |
| `/problems/:slug` | Problem detail + canvas mount point |
| `/explore` | Community solution feed |
| `/profile/:username` | User profile |
| `/login` | Sign in / register (email + password) |
| `/dashboard` | Post-login home feed (auth-gated) |

## Live collaborative canvas

The problem page now renders a **real, realtime canvas** wired to the backend's
operation-log collaboration engine — not a placeholder.

- **Bootstrap:** on opening a problem (while signed in), the client gets-or-creates
  a "FlowState Practice" workspace and a canvas named after the problem
  (`getOrCreateProblemCanvas` in `src/lib/api.ts`).
- **Transport:** a WebSocket to `/api/v1/canvases/{id}/ws?token=…&since=…`
  ([useCanvasSocket.ts](src/hooks/useCanvasSocket.ts)) — replays missed operations
  on connect, applies live `create/move/resize/delete_shape` ops, and shows
  presence + live cursors. Heartbeat ping + auto-reconnect (resuming from the last
  applied version) are built in.
- **State:** operations are folded into shape state by a deterministic reducer
  ([canvas-state.ts](src/lib/canvas-state.ts)), matching the backend's total
  ordering. Local edits are applied optimistically, then confirmed by the
  server's versioned echo.
- **Tools:** select/move, rectangle, ellipse, arrow, text, resize handle, delete.

Requires being **signed in** (WS auth needs a real user + workspace membership)
and a running backend with Postgres. Unauthenticated users see a sign-in gate.

The canvas mount point still exposes the contract used by any externally-injected
tooling: container id **`flowstate-canvas`** and **`window.__flowstateReady`**.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the production build
- `npm run lint` — `tsc --noEmit`
