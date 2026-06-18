import { useCallback, useEffect, useRef, useState } from "react";
import { canvasSocketUrl } from "@/lib/api";
import { applyOperation, applyOperations } from "@/lib/canvas-state";
import type { ShapeMap } from "@/lib/canvas-state";
import type {
  ConnectionStatus,
  OperationType,
  PresenceUser,
  SelfInfo,
  ServerMessage,
  Shape,
} from "@/types/canvas";

export interface RemoteCursor {
  x: number;
  y: number;
  name: string;
}

export interface CanvasSocket {
  status: ConnectionStatus;
  shapes: Shape[];
  version: number;
  presence: PresenceUser[];
  you: SelfInfo | null;
  cursors: Record<string, RemoteCursor>;
  error: string | null;
  commit: (
    opType: OperationType,
    payload: Record<string, unknown>,
  ) => void;
  sendCursor: (x: number, y: number) => void;
}

const HEARTBEAT_MS = 25_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 15_000;
const CURSOR_THROTTLE_MS = 45;

export function useCanvasSocket(canvasId: string | null): CanvasSocket {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [you, setYou] = useState<SelfInfo | null>(null);
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const shapeMapRef = useRef<ShapeMap>(new Map());
  const versionRef = useRef(0);
  const closedByUsRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const lastCursorSentRef = useRef(0);
  const nameByUserRef = useRef<Record<string, string>>({});

  const flushShapes = useCallback(() => {
    setShapes(Array.from(shapeMapRef.current.values()));
  }, []);

  const handleMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case "sync": {
          applyOperations(shapeMapRef.current, msg.operations);
          versionRef.current = msg.current_version;
          setVersion(msg.current_version);
          setYou(msg.you);
          setPresence(msg.presence);
          nameByUserRef.current = Object.fromEntries(
            msg.presence.map((p) => [p.user_id, p.display_name]),
          );
          flushShapes();
          break;
        }
        case "operation": {
          const op = msg.operation;
          applyOperation(shapeMapRef.current, op.type, op.payload);
          if (op.version > versionRef.current) {
            versionRef.current = op.version;
            setVersion(op.version);
          }
          flushShapes();
          break;
        }
        case "presence_join": {
          nameByUserRef.current[msg.user.user_id] = msg.user.display_name;
          setPresence((prev) =>
            prev.some((p) => p.user_id === msg.user.user_id)
              ? prev
              : [...prev, msg.user],
          );
          break;
        }
        case "presence_leave": {
          setPresence((prev) =>
            prev.filter((p) => p.user_id !== msg.user_id),
          );
          setCursors((prev) => {
            const next = { ...prev };
            delete next[msg.user_id];
            return next;
          });
          break;
        }
        case "cursor": {
          setCursors((prev) => ({
            ...prev,
            [msg.user_id]: {
              x: msg.x,
              y: msg.y,
              name: nameByUserRef.current[msg.user_id] ?? "Someone",
            },
          }));
          break;
        }
        case "error": {
          setError(msg.detail);
          break;
        }
        case "pong":
          break;
      }
    },
    [flushShapes],
  );

  useEffect(() => {
    if (!canvasId) return;

    closedByUsRef.current = false;
    shapeMapRef.current = new Map();
    versionRef.current = 0;
    setShapes([]);
    setVersion(0);
    setPresence([]);
    setCursors({});
    setError(null);

    const clearTimers = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (heartbeatTimerRef.current !== null) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const connect = () => {
      setStatus("connecting");
      const ws = new WebSocket(canvasSocketUrl(canvasId, versionRef.current));
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setStatus("open");
        setError(null);
        heartbeatTimerRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(event.data) as ServerMessage);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => setStatus("error");

      ws.onclose = () => {
        if (heartbeatTimerRef.current !== null) {
          window.clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        if (closedByUsRef.current) {
          setStatus("closed");
          return;
        }
        setStatus("closed");
        const attempt = reconnectAttemptsRef.current++;
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** attempt,
          RECONNECT_MAX_MS,
        );
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUsRef.current = true;
      clearTimers();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [canvasId, handleMessage]);

  const commit = useCallback(
    (opType: OperationType, payload: Record<string, unknown>) => {
      applyOperation(shapeMapRef.current, opType, payload);
      flushShapes();

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "operation",
            op_type: opType,
            payload,
            client_op_id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          }),
        );
      }
    },
    [flushShapes],
  );

  const sendCursor = useCallback((x: number, y: number) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastCursorSentRef.current < CURSOR_THROTTLE_MS) return;
    lastCursorSentRef.current = now;
    ws.send(JSON.stringify({ type: "cursor", x, y }));
  }, []);

  return {
    status,
    shapes,
    version,
    presence,
    you,
    cursors,
    error,
    commit,
    sendCursor,
  };
}
