# FlowState

> A backend-first realtime collaborative whiteboard, built to explore synchronization, event-driven architecture, replay engines, and scalable realtime backend design.

FlowState is a production-style collaborative whiteboard built primarily as a systems / backend architecture project. The interesting part isn't the drawing surface — it's the engine underneath: an immutable, backend-ordered operation log with deterministic replay, snapshots, version history, and live multi-user sync.

---

## Status

**Phase 1 (MVP backend) is complete and tested end to end.** The whole collaboration engine works: auth, role-based access, the operation log, realtime WebSocket sync, snapshot/replay reconstruction, version control, and undo/redo.

The frontend (React + Konva) is the next milestone and is not built yet — today the system is exercised over its REST + WebSocket API.

---

## What's built

**Accounts & access**
- JWT auth with separate access and refresh tokens
- Workspaces with role-based membership (`viewer` / `editor` / `owner`)
- Multi-canvas workspaces; access inherited from workspace membership

**Collaboration engine**
- Immutable, append-only operation log per canvas
- Backend-authoritative version ordering (gap-free, monotonic, holds under concurrent writers)
- Idempotent commits via client-supplied operation ids (safe retries / reconnects)
- Snapshot + replay state reconstruction, with time-travel to any version
- Periodic automatic snapshots to bound replay cost

**Realtime**
- Per-canvas WebSocket rooms with live operation broadcast
- Presence (who's here) and cursor sharing
- Reconnect recovery: a reconnecting client replays only what it missed
- Heartbeat-based cleanup of dead connections

**Version control & history**
- Named checkpoints (git-tag style) over the operation log
- Shape-level diff between any two versions
- Immutable restore (restoring appends forward operations; history is never rewritten)
- Per-user undo/redo via inverse operations

**Activity**
- GitHub/LeetCode-style contribution heatmap: per-day counts, totals, current and longest streaks

---

## Architecture & key design decisions

These are the choices the project is really about.

**Backend-authoritative ordering.** Clients never choose version numbers. Each canvas has a counter incremented with `UPDATE ... RETURNING` inside the same transaction as the operation insert. The row lock serializes concurrent committers, so every canvas gets a single total order with no gaps or duplicates — verified by firing parallel commits and checking the result.

**Operations are immutable events.** Every committed action is one append-only row. Nothing is ever updated or deleted. That single rule is what makes deterministic replay, undo/redo, version history, and recovery all possible from the same data.

**Snapshot + replay.** Current state is reconstructed as `nearest snapshot + replay of the operations after it`, instead of replaying the whole log every time. The reducer is a pure, I/O-free function, so reconstruction is deterministic and `?at=<version>` gives free time-travel. Snapshots are derived data — they only bound cost, they're never a source of truth.

**Immutable restore & undo.** Restoring to an old version doesn't rewind history — it diffs current vs. target and appends new forward operations to reach it. Undo appends the *inverse* of an operation. So "undo" and "restore" are themselves recorded events you can later replay or undo again. Per-user undo/redo stacks are rebuilt from the log on demand rather than stored as mutable state.

**One write path.** REST commits, WebSocket commits, restore, and undo/redo all flow through a single commit-and-broadcast function, so every connected client converges regardless of how an operation entered the system.

**Access checks don't leak existence.** Non-members receive `404`, not `403`, so workspace and canvas ids can't be probed.

---

## Tech stack

- **API:** FastAPI, Pydantic v2
- **Database:** PostgreSQL, SQLAlchemy 2 (async / asyncpg), Alembic migrations, JSONB operation/snapshot storage
- **Auth:** PyJWT, bcrypt
- **Realtime:** native WebSockets, in-memory room manager
- **Infra:** Docker, Docker Compose

---

## Getting started

Requirements: Docker and Docker Compose.

```bash
# 1. configure environment
cp .env.example .env
# set a real SECRET_KEY in .env:
python -c "import secrets; print(secrets.token_urlsafe(64))"

# 2. start Postgres + the API
docker compose -f infra/docker-compose.yml up -d --build

# 3. apply database migrations
docker exec flowstate-backend alembic upgrade head
```

The API is then at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

Health checks: `GET /api/v1/health` (liveness) and `GET /api/v1/health/db` (database).

---

## API overview

All routes are under `/api/v1`.

| Area | Endpoint | Notes |
| --- | --- | --- |
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me` | access + refresh tokens |
| Workspaces | `POST/GET /workspaces` · `GET /workspaces/{id}` | |
| Members | `GET/POST /workspaces/{id}/members` | add requires `owner` |
| Canvases | `POST/GET /workspaces/{id}/canvases` · `GET /canvases/{id}` | create requires `editor` |
| Operations | `POST /canvases/{id}/operations` · `GET /canvases/{id}/operations?since=` | commit requires `editor` |
| State | `GET /canvases/{id}/state?at=` | reconstructed via snapshot + replay |
| Snapshots | `POST/GET /canvases/{id}/snapshots` | |
| Versions | `POST/GET /canvases/{id}/versions` · `GET /canvases/{id}/diff?from=&to=` · `POST /canvases/{id}/restore` | |
| Undo/redo | `POST /canvases/{id}/undo` · `POST /canvases/{id}/redo` | per-user |
| Activity | `GET /me/activity` · `GET /users/{id}/activity` | optional `?year=` |
| Realtime | `WS /canvases/{id}/ws?token=&since=` | sync, broadcast, presence, cursors |

### WebSocket protocol (brief)

Client → server: `operation`, `cursor`, `ping`.
Server → client: `sync` (initial state + presence + missed ops), `operation`, `presence_join` / `presence_leave`, `cursor`, `pong`, `error`.

---

## Data model

- **User** — account + credentials
- **Workspace** / **WorkspaceMember** — ownership container + role-based membership
- **Canvas** — a collaborative surface; holds the monotonic version counter
- **Operation** — one immutable entry in the canvas log (with optional `undo_of` link)
- **Snapshot** — materialized canvas state at a version (derived, rebuildable)
- **CanvasVersion** — a named checkpoint pointing at a version

---

## Roadmap

**Phase 1 — MVP (done):** auth, workspaces, multi-canvas, operation log, WebSocket sync, snapshots, replay reconstruction, reconnect recovery, undo/redo, basic permissions. Plus version control and a contribution heatmap.

**Phase 2 — Alpha:** React + Konva frontend, more shapes/tools, canvas export, Redis pub/sub for multi-instance rooms, snapshot tuning.

**Phase 3 — Beta:** workspace invites, advanced RBAC, comments, analytics dashboards, observability, rate limiting, cloud deployment.

---

## Philosophy

FlowState is deliberately a systems engineering project disguised as a whiteboard. The goal is to understand realtime synchronization, persistence models, replay engines, and deterministic state reconstruction by actually building them.
