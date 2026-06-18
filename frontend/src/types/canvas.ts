export type ShapeType = "rect" | "ellipse" | "arrow" | "text" | "component";

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  /** Label text (text shapes) or node label (component shapes). */
  text?: string;
  /** System-design component kind, when type === "component". */
  variant?: string;
  /** For arrows: id of the shape the start is anchored to (else free). */
  fromId?: string;
  /** For arrows: id of the shape the end is anchored to (else free). */
  toId?: string;
}

/** Backend OperationType enum values. */
export type OperationType =
  | "create_shape"
  | "move_shape"
  | "resize_shape"
  | "delete_shape";

/** Matches the backend `OperationRead` schema. */
export interface CanvasOperation {
  id: string;
  canvas_id: string;
  version: number;
  type: OperationType;
  payload: Record<string, unknown>;
  created_by: string | null;
  client_op_id: string | null;
  created_at: string;
}

export interface PresenceUser {
  user_id: string;
  display_name: string;
}

export interface SelfInfo {
  user_id: string;
  display_name: string;
  role: string;
}

/** Server -> client messages. */
export type ServerMessage =
  | {
      type: "sync";
      canvas_id: string;
      current_version: number;
      operations: CanvasOperation[];
      presence: PresenceUser[];
      you: SelfInfo;
    }
  | { type: "operation"; operation: CanvasOperation }
  | { type: "presence_join"; user: PresenceUser }
  | { type: "presence_leave"; user_id: string }
  | { type: "cursor"; user_id: string; x: number; y: number }
  | { type: "pong" }
  | { type: "error"; detail: string };

/** Client -> server messages. */
export type ClientMessage =
  | {
      type: "operation";
      op_type: OperationType;
      payload: Record<string, unknown>;
      client_op_id?: string;
    }
  | { type: "cursor"; x: number; y: number }
  | { type: "ping" };

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

/** Shape colors available in the toolbar (brand-forward). */
export const CANVAS_COLORS = [
  "#0d9488", // teal-600 (brand)
  "#22d3ee", // cyan-400
  "#6366f1", // indigo-500
  "#f43f5e", // rose-500
  "#f59e0b", // amber-500
  "#334155", // slate-700
] as const;

/** Deterministic cursor color per user id (so labels stay stable). */
export function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CANVAS_COLORS[hash % CANVAS_COLORS.length];
}
