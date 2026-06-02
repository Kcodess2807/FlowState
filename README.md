# FlowState

> A backend-first realtime collaborative whiteboard engineered to deeply explore synchronization systems, event-driven architecture, replay engines, and scalable realtime backend design.

---

# Overview

FlowState is a production-style collaborative whiteboard platform built primarily as a systems engineering and backend architecture project.

Unlike traditional canvas applications focused mainly on frontend interactions, FlowState is designed around the complexities of:
- realtime synchronization
- operation ordering
- replayable event systems
- websocket orchestration
- snapshot-based recovery
- deterministic state reconstruction
- collaborative distributed systems

The project follows a system-design-first approach where architecture, lifecycle modeling, persistence strategies, and failure handling are planned extensively before implementation.

---

# Vision

FlowState aims to simulate how collaborative platforms like:
- Figma
- Excalidraw
- Miro
- Notion multiplayer systems

manage:
- concurrent collaboration
- realtime state synchronization
- operation replay
- recovery after failures
- scalable room-based architectures

while remaining intentionally backend-first.

---

# Core Architectural Principles

## Backend-Authoritative Synchronization
The backend acts as the single source of truth for all collaborative state.

---

## Operation-Based Collaboration
Instead of transmitting full canvas states, every committed user action is represented as an immutable operation.

Examples:
- create_shape
- move_shape
- resize_shape
- delete_shape

---

## Mutable Live State + Immutable History
FlowState separates:
- current mutable canvas state
- immutable operation history

allowing:
- deterministic replay
- recovery
- undo/redo
- version history
- auditing

---

## Snapshot + Replay Recovery
Canvas state reconstruction uses:
- periodic snapshots
- replay of operations after snapshot version

This enables efficient recovery and scalable synchronization.

---

# System Design First Development

FlowState is intentionally being developed using a:

## system-design-first engineering approach

Before implementation, the project architecture was deeply planned through:
- synchronization diagrams
- websocket lifecycle flows
- replay reconstruction models
- failure recovery systems
- state ownership boundaries
- persistence strategies
- operation lifecycle diagrams
- version ordering systems
- room architecture planning

The repository is designed not only as an application codebase, but also as:

> a public backend systems engineering case study.

The goal is to document:
- architectural tradeoffs
- distributed systems thinking
- realtime synchronization patterns
- persistence design
- scalability evolution

through diagrams, implementation phases, and iterative engineering.

---

# Tech Stack

## Frontend
- React + Vite
- Zustand
- Konva.js
- Native WebSockets

---

## Backend
- FastAPI
- SQLAlchemy 2 Async
- Pydantic v2
- JWT Authentication
- WebSocket Room Manager

---

## Database
- PostgreSQL
- JSONB operation storage
- Alembic migrations

---

## Infrastructure & Tooling
- Docker
- Docker Compose
- Ruff
- MyPy
- Pytest

---

# Core Backend Primitives

The collaboration engine is built around a small set of core primitives:

- websocket_room
- operation
- operation_log
- version_counter
- snapshot
- replay_engine
- presence
- room_manager

These primitives form the foundation of the realtime synchronization architecture.

---

# System Design Highlights

## Realtime Collaboration
- Canvas-based websocket rooms
- Live operation broadcasting
- Presence synchronization
- Heartbeat-based cleanup
- Reconnect recovery

---

## Persistence Engine
- Immutable operation logs
- Monotonic version ordering
- Snapshot generation
- Replay reconstruction engine

---

## Synchronization Model
- Backend-authoritative ordering
- Deterministic replay
- Transient vs persistent state separation
- Committed vs non-committed operations

---

# Launch Roadmap

# Phase 1 — MVP

The MVP focuses on validating the core realtime collaboration architecture.

## Features
- User authentication
- Workspace creation
- Multi-canvas architecture
- Rectangle rendering and movement
- Native WebSocket synchronization
- In-memory room manager
- Operation persistence
- Snapshot generation
- Replay reconstruction
- Reconnect recovery
- Undo/redo via inverse operations
- Presence cursors
- Basic permissions system

---

## MVP Goals
- Stable realtime collaboration
- Clean synchronization architecture
- Replayable operation system
- Deterministic canvas reconstruction
- Backend lifecycle correctness

---

## MVP Constraints
- Single backend instance
- No Redis initially
- No CRDTs
- No offline synchronization
- No distributed scaling yet

The focus is architecture correctness over infrastructure scale.

---

# Phase 2 — Alpha

The Alpha phase expands collaborative robustness and introduces distributed synchronization improvements.

## Features
- Additional shapes and tools
- Selection synchronization
- Canvas export (PNG/SVG)
- Canvas version history
- Time-travel replay
- Redis pub/sub integration
- Distributed websocket synchronization
- Better snapshot optimization
- Activity tracking
- Enhanced room lifecycle handling

---

## Alpha Goals
- Multi-instance backend support
- Better replay performance
- Improved persistence throughput
- Scalable room synchronization
- Reduced synchronization latency

---

# Phase 3 — Beta

The Beta phase focuses on production-grade collaboration workflows and extensibility.

## Features
- Workspace sharing and invites
- Advanced RBAC permissions
- Collaborative comments
- Multiplayer cursor enhancements
- Analytics dashboards
- Mermaid diagram import/export
- Plugin-ready architecture
- Observability and monitoring
- Rate limiting and abuse protection
- Cloud deployment pipeline

---

## Beta Goals
- Horizontally scalable infrastructure
- Production-grade observability
- Extensible collaboration engine
- Advanced recovery systems
- Cloud-native deployment readiness

---

# Engineering Concepts Explored

FlowState explores several advanced backend and systems engineering concepts:

- Realtime systems
- Event-driven architecture
- WebSocket lifecycle management
- Replay engines
- Snapshot recovery systems
- Distributed systems fundamentals
- Presence systems
- Operation versioning
- Deterministic synchronization
- State ownership boundaries
- Failure recovery strategies
- Scalability evolution

---

# Future Exploration Areas

Potential future directions:
- CRDT experimentation
- Offline-first synchronization
- AI-assisted diagram generation
- Collaborative voice/video layers
- Distributed replay workers
- Event-streaming infrastructure
- Full plugin ecosystem

---

# Project Philosophy

FlowState is intentionally designed as:

> a systems engineering project disguised as a collaborative whiteboard platform.

The primary goal is not merely building a drawing application, but deeply understanding:
- realtime architecture
- synchronization systems
- persistence models
- replay engines
- distributed collaboration
- scalable backend design

through practical implementation and iterative systems engineering.