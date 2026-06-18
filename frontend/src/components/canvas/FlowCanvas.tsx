import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowUpRight,
  IconCircle,
  IconDownload,
  IconMaximize,
  IconMinus,
  IconPhoto,
  IconPlus,
  IconPointer,
  IconSearch,
  IconSquare,
  IconTrash,
  IconTypography,
} from "@tabler/icons-react";
import { useCanvasSocket } from "@/hooks/useCanvasSocket";
import { CANVAS_COLORS, colorForUser } from "@/types/canvas";
import type { OperationType, Shape, ShapeType } from "@/types/canvas";
import {
  COMPONENT_H,
  COMPONENT_W,
  STENCILS,
  stencilFor,
} from "./stencils";
import type { ComponentVariant } from "./stencils";
import { cn } from "@/lib/utils";

interface Command {
  type: OperationType;
  payload: Record<string, unknown>;
}
interface HistoryEntry {
  forwards: Command[];
  inverses: Command[];
}

type DrawTool = "rect" | "ellipse" | "arrow" | "text";
type Tool = "select" | DrawTool | "component";

const TOOLS: { id: Tool; icon: typeof IconPointer; label: string }[] = [
  { id: "select", icon: IconPointer, label: "Select / move" },
  { id: "rect", icon: IconSquare, label: "Rectangle" },
  { id: "ellipse", icon: IconCircle, label: "Ellipse" },
  { id: "arrow", icon: IconArrowUpRight, label: "Arrow" },
  { id: "text", icon: IconTypography, label: "Text" },
];

const TOOL_SHAPE: Record<DrawTool, ShapeType> = {
  rect: "rect",
  ellipse: "ellipse",
  arrow: "arrow",
  text: "text",
};

interface Gesture {
  mode: "none" | "create" | "move" | "resize";
  startX: number;
  startY: number;
  orig?: Shape;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

interface View {
  x: number;
  y: number;
  scale: number;
}

// Normalize a box so (x,y) is top-left and (w,h) positive.
export function normalize(s: Shape): Shape {
  if (s.type === "arrow") return s;
  let { x, y, w, h } = s;
  if (w < 0) {
    x += w;
    w = -w;
  }
  if (h < 0) {
    y += h;
    h = -h;
  }
  return { ...s, x, y, w, h };
}

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function isAnchorable(s: Shape): boolean {
  return s.type === "component" || s.type === "rect" || s.type === "ellipse";
}

function centerOf(s: Shape): { x: number; y: number } {
  const n = normalize(s);
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

function anchorOnBox(
  s: Shape,
  tx: number,
  ty: number,
  gap = 4,
): { x: number; y: number } {
  const n = normalize(s);
  const cx = n.x + n.w / 2;
  const cy = n.y + n.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = n.w / 2 + gap;
  const hh = n.h / 2 + gap;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

export interface ArrowPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function resolveArrow(
  arrow: Shape,
  index: Map<string, Shape>,
): ArrowPoints {
  const from = arrow.fromId ? index.get(arrow.fromId) : undefined;
  const to = arrow.toId ? index.get(arrow.toId) : undefined;
  const freeStart = { x: arrow.x, y: arrow.y };
  const freeEnd = { x: arrow.x + arrow.w, y: arrow.y + arrow.h };
  const ref1 = to ? centerOf(to) : freeEnd;
  const ref2 = from ? centerOf(from) : freeStart;
  const p1 = from ? anchorOnBox(from, ref1.x, ref1.y) : freeStart;
  const p2 = to ? anchorOnBox(to, ref2.x, ref2.y) : freeEnd;
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
}

function hitTest(
  shapes: Shape[],
  px: number,
  py: number,
  index: Map<string, Shape>,
  scale = 1,
): Shape | null {
  // Tolerances are in world units; keep them ~constant on screen.
  const pad = 6 / scale;
  const lineTol = 9 / scale;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    if (s.type === "arrow") {
      const { x1, y1, x2, y2 } = resolveArrow(s, index);
      if (distToSegment(px, py, x1, y1, x2, y2) < lineTol) return s;
    } else {
      const n = normalize(s);
      const w = s.type === "text" ? Math.max(n.w, 40) : n.w;
      const h = s.type === "text" ? Math.max(n.h, 22) : n.h;
      if (
        px >= n.x - pad &&
        px <= n.x + w + pad &&
        py >= n.y - pad &&
        py <= n.y + h + pad
      )
        return s;
    }
  }
  return null;
}

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed,
  )}&backgroundColor=ccfbf1`;

export function FlowCanvas({ canvasId }: { canvasId: string }) {
  const socket = useCanvasSocket(canvasId);
  const { shapes, commit, sendCursor, cursors, presence, you, status, version } =
    socket;

  const [tool, setTool] = useState<Tool>("select");
  const [componentVariant, setComponentVariant] =
    useState<ComponentVariant>("server");
  const [color, setColor] = useState<string>(CANVAS_COLORS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkTargetId, setLinkTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [editing, setEditing] = useState<{
    x: number;
    y: number;
    id?: string;
    orig?: Shape;
  } | null>(null);
  const [editText, setEditText] = useState("");
  const [, setHistoryVersion] = useState(0);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gestureRef = useRef<Gesture>({ mode: "none", startX: 0, startY: 0 });
  const draftRef = useRef<Shape | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const shapesRef = useRef<Shape[]>(shapes);
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const viewRef = useRef<View>(view);
  const spaceDownRef = useRef(false);
  const panRef = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  draftRef.current = draft;
  shapesRef.current = shapes;
  viewRef.current = view;

  const applyBatch = useCallback(
    (forwards: Command[], inverses: Command[]) => {
      if (forwards.length === 0) return;
      forwards.forEach((c) => commit(c.type, c.payload));
      undoStackRef.current.push({ forwards, inverses });
      redoStackRef.current = [];
      setHistoryVersion((v) => v + 1);
    },
    [commit],
  );

  const run = useCallback(
    (forward: Command, inverse: Command) => applyBatch([forward], [inverse]),
    [applyBatch],
  );

  const undo = useCallback(() => {
    const entry = undoStackRef.current.pop();
    if (!entry) return;
    entry.inverses.forEach((c) => commit(c.type, c.payload));
    redoStackRef.current.push(entry);
    setSelectedId(null);
    setHistoryVersion((v) => v + 1);
  }, [commit]);

  const redo = useCallback(() => {
    const entry = redoStackRef.current.pop();
    if (!entry) return;
    entry.forwards.forEach((c) => commit(c.type, c.payload));
    undoStackRef.current.push(entry);
    setHistoryVersion((v) => v + 1);
  }, [commit]);

  const asPayload = (s: Shape) => s as unknown as Record<string, unknown>;

  // Deleting a node also removes connectors anchored to it, as one undo step.
  const deleteShape = useCallback(
    (id: string) => {
      const shape = shapesRef.current.find((s) => s.id === id);
      if (!shape) return;
      const forwards: Command[] = [{ type: "delete_shape", payload: { id } }];
      const inverses: Command[] = [
        { type: "create_shape", payload: asPayload(shape) },
      ];
      if (isAnchorable(shape)) {
        for (const a of shapesRef.current) {
          if (a.type === "arrow" && (a.fromId === id || a.toId === id)) {
            forwards.push({ type: "delete_shape", payload: { id: a.id } });
            inverses.push({ type: "create_shape", payload: asPayload(a) });
          }
        }
      }
      applyBatch(forwards, inverses);
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [applyBatch],
  );

  const zoomAt = useCallback((sx: number, sy: number, factor: number) => {
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / v.scale;
      return { scale, x: sx - (sx - v.x) * k, y: sy - (sy - v.y) * k };
    });
  }, []);

  const zoomFromCenter = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, factor);
  };

  const fitToContent = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const ss = shapesRef.current;
    if (ss.length === 0) {
      setView({ x: 0, y: 0, scale: 1 });
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const s of ss) {
      let x1: number;
      let y1: number;
      let x2: number;
      let y2: number;
      if (s.type === "arrow") {
        x1 = Math.min(s.x, s.x + s.w);
        y1 = Math.min(s.y, s.y + s.h);
        x2 = Math.max(s.x, s.x + s.w);
        y2 = Math.max(s.y, s.y + s.h);
      } else {
        const n = normalize(s);
        x1 = n.x;
        y1 = n.y;
        x2 = n.x + (s.type === "text" ? Math.max(n.w, 40) : n.w);
        y2 = n.y + (s.type === "text" ? Math.max(n.h, 22) : n.h);
      }
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    }
    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const r = el.getBoundingClientRect();
    const pad = 64;
    const scale = clamp(
      Math.min((r.width - pad * 2) / bw, (r.height - pad * 2) / bh),
      MIN_SCALE,
      MAX_SCALE,
    );
    setView({
      x: (r.width - bw * scale) / 2 - minX * scale,
      y: (r.height - bh * scale) / 2 - minY * scale,
      scale,
    });
  }, []);

  useEffect(() => {
    window.__flowstateReady = true;
    return () => {
      window.__flowstateReady = false;
    };
  }, []);

  // Wheel: pan by default, zoom toward the cursor with ctrl/cmd (or pinch).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.01));
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Hold space to pan.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      );
    };
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping()) {
        spaceDownRef.current = true;
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDownRef.current = false;
        setSpaceDown(false);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Keyboard: delete selected, undo/redo, clear selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if (typing || editing) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteShape(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editing, deleteShape, undo, redo]);

  const getScreen = (e: { clientX: number; clientY: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getPoint = (e: { clientX: number; clientY: number }) => {
    const s = getScreen(e);
    const v = viewRef.current;
    return { x: (s.x - v.x) / v.scale, y: (s.y - v.y) / v.scale };
  };

  // Merge committed shapes with the in-progress draft.
  const rendered: Shape[] = (() => {
    if (!draft) return shapes;
    const idx = shapes.findIndex((s) => s.id === draft.id);
    if (idx === -1) return [...shapes, draft];
    const copy = shapes.slice();
    copy[idx] = draft;
    return copy;
  })();

  const selected = selectedId
    ? rendered.find((s) => s.id === selectedId) ?? null
    : null;

  const byId = new Map(rendered.map((s) => [s.id, s]));

  const isBoundArrow = (s: Shape) =>
    s.type === "arrow" && Boolean(s.fromId || s.toId);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    svgRef.current?.setPointerCapture(e.pointerId);

    // Pan with space-drag or the middle mouse button.
    if (spaceDownRef.current || e.button === 1) {
      const s = getScreen(e);
      const v = viewRef.current;
      panRef.current = { active: true, sx: s.x, sy: s.y, ox: v.x, oy: v.y };
      setIsPanning(true);
      return;
    }

    const p = getPoint(e);

    if (tool === "select") {
      if (selected && selected.type !== "text" && !isBoundArrow(selected)) {
        const n = normalize(selected);
        const hx = selected.type === "arrow" ? selected.x + selected.w : n.x + n.w;
        const hy = selected.type === "arrow" ? selected.y + selected.h : n.y + n.h;
        if (Math.hypot(p.x - hx, p.y - hy) < 12 / viewRef.current.scale) {
          gestureRef.current = {
            mode: "resize",
            startX: p.x,
            startY: p.y,
            orig: selected,
          };
          return;
        }
      }
      const hit = hitTest(shapes, p.x, p.y, byId, viewRef.current.scale);
      if (hit) {
        setSelectedId(hit.id);
        if (!isBoundArrow(hit)) {
          gestureRef.current = {
            mode: "move",
            startX: p.x,
            startY: p.y,
            orig: hit,
          };
        }
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === "text") {
      setSelectedId(null);
      setEditing({ x: p.x, y: p.y });
      setEditText("");
      setTimeout(() => editInputRef.current?.focus(), 0);
      return;
    }

    if (tool === "component") {
      const stencil = stencilFor(componentVariant);
      const shape: Shape = {
        id: newId(),
        type: "component",
        x: p.x - COMPONENT_W / 2,
        y: p.y - COMPONENT_H / 2,
        w: COMPONENT_W,
        h: COMPONENT_H,
        color: stencil.color,
        variant: stencil.variant,
        text: stencil.label,
      };
      setDraft(shape);
      setSelectedId(null);
      gestureRef.current = { mode: "create", startX: p.x, startY: p.y };
      return;
    }

    if (tool === "arrow") {
      const over = hitTest(shapes, p.x, p.y, byId, viewRef.current.scale);
      const fromId = over && isAnchorable(over) ? over.id : undefined;
      setDraft({
        id: newId(),
        type: "arrow",
        x: p.x,
        y: p.y,
        w: 0,
        h: 0,
        color,
        ...(fromId ? { fromId } : {}),
      });
      setSelectedId(null);
      gestureRef.current = { mode: "create", startX: p.x, startY: p.y };
      return;
    }

    const shape: Shape = {
      id: newId(),
      type: TOOL_SHAPE[tool],
      x: p.x,
      y: p.y,
      w: 0,
      h: 0,
      color,
    };
    setDraft(shape);
    setSelectedId(null);
    gestureRef.current = { mode: "create", startX: p.x, startY: p.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (panRef.current.active) {
      const s = getScreen(e);
      const pan = panRef.current;
      setView((v) => ({
        ...v,
        x: pan.ox + (s.x - pan.sx),
        y: pan.oy + (s.y - pan.sy),
      }));
      return;
    }

    const p = getPoint(e);
    sendCursor(p.x, p.y);

    const g = gestureRef.current;
    if (g.mode === "none") return;

    if (g.mode === "create" && draftRef.current) {
      const d = draftRef.current;
      if (d.type === "component") {
        setDraft({ ...d, x: p.x - d.w / 2, y: p.y - d.h / 2 });
      } else if (d.type === "arrow") {
        const over = hitTest(shapes, p.x, p.y, byId, viewRef.current.scale);
        const toId =
          over && isAnchorable(over) && over.id !== d.fromId
            ? over.id
            : undefined;
        setLinkTargetId(toId ?? null);
        setDraft({
          ...d,
          w: p.x - g.startX,
          h: p.y - g.startY,
          toId,
        });
      } else {
        setDraft({ ...d, w: p.x - g.startX, h: p.y - g.startY });
      }
    } else if (g.mode === "move" && g.orig) {
      const dx = p.x - g.startX;
      const dy = p.y - g.startY;
      setDraft({ ...g.orig, x: g.orig.x + dx, y: g.orig.y + dy });
    } else if (g.mode === "resize" && g.orig) {
      const dx = p.x - g.startX;
      const dy = p.y - g.startY;
      setDraft({ ...g.orig, w: g.orig.w + dx, h: g.orig.h + dy });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    svgRef.current?.releasePointerCapture(e.pointerId);

    if (panRef.current.active) {
      panRef.current.active = false;
      setIsPanning(false);
      return;
    }

    const g = gestureRef.current;
    const d = draftRef.current;
    gestureRef.current = { mode: "none", startX: 0, startY: 0 };

    if (!d) return;

    setLinkTargetId(null);

    if (g.mode === "create") {
      const keep =
        d.type === "component" ||
        Boolean(d.toId) ||
        Math.abs(d.w) > 4 ||
        Math.abs(d.h) > 4;
      if (keep) {
        const shape = d.type === "arrow" ? d : normalize(d);
        run(
          {
            type: "create_shape",
            payload: shape as unknown as Record<string, unknown>,
          },
          { type: "delete_shape", payload: { id: shape.id } },
        );
        setSelectedId(shape.id);
      }
    } else if (g.mode === "move" && g.orig) {
      run(
        { type: "move_shape", payload: { id: d.id, x: d.x, y: d.y } },
        {
          type: "move_shape",
          payload: { id: d.id, x: g.orig.x, y: g.orig.y },
        },
      );
    } else if (g.mode === "resize" && g.orig) {
      const n = d.type === "arrow" ? d : normalize(d);
      const o = g.orig;
      run(
        {
          type: "resize_shape",
          payload: { id: n.id, x: n.x, y: n.y, w: n.w, h: n.h },
        },
        {
          type: "resize_shape",
          payload: { id: o.id, x: o.x, y: o.y, w: o.w, h: o.h },
        },
      );
    }
    setDraft(null);
  };

  const commitText = () => {
    if (!editing) return;
    const text = editText.trim();

    if (editing.orig) {
      const orig = editing.orig;
      if (orig.type === "text" && !text) {
        run(
          { type: "delete_shape", payload: { id: orig.id } },
          { type: "create_shape", payload: asPayload(orig) },
        );
      } else if (text !== (orig.text ?? "")) {
        const updated: Shape =
          orig.type === "text"
            ? { ...orig, text, w: Math.max(40, text.length * 9) }
            : { ...orig, text };
        run(
          { type: "create_shape", payload: asPayload(updated) },
          { type: "create_shape", payload: asPayload(orig) },
        );
      }
    } else if (text) {
      const shape: Shape = {
        id: newId(),
        type: "text",
        x: editing.x,
        y: editing.y,
        w: Math.max(40, text.length * 9),
        h: 24,
        color,
        text,
      };
      run(
        { type: "create_shape", payload: asPayload(shape) },
        { type: "delete_shape", payload: { id: shape.id } },
      );
    }
    setEditing(null);
    setEditText("");
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const p = getPoint(e);
    const hit = hitTest(shapes, p.x, p.y, byId, viewRef.current.scale);
    if (
      hit &&
      (hit.type === "text" || hit.type === "component" || hit.type === "arrow")
    ) {
      setSelectedId(hit.id);
      let pos: { x: number; y: number };
      if (hit.type === "component") {
        pos = { x: hit.x + 6, y: hit.y + hit.h - 26 };
      } else if (hit.type === "arrow") {
        const { x1, y1, x2, y2 } = resolveArrow(hit, byId);
        pos = { x: (x1 + x2) / 2 - 44, y: (y1 + y2) / 2 - 14 };
      } else {
        pos = { x: hit.x, y: hit.y };
      }
      setEditing({ ...pos, id: hit.id, orig: hit });
      setEditText(hit.text ?? "");
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  };

  const cursorClass = isPanning
    ? "cursor-grabbing"
    : spaceDown
      ? "cursor-grab"
      : tool === "select"
        ? gestureRef.current.mode === "move"
          ? "cursor-grabbing"
          : "cursor-default"
        : tool === "text"
          ? "cursor-text"
          : "cursor-crosshair";

  const toScreen = (wx: number, wy: number) => ({
    x: wx * view.scale + view.x,
    y: wy * view.scale + view.y,
  });

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-hairline bg-elevated px-3 py-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={tool === t.id}
            onClick={() => setTool(t.id)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              tool === t.id
                ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                : "text-ink-muted hover:bg-white/[0.06]",
            )}
          >
            <t.icon size={18} />
          </button>
        ))}

        <div className="mx-1 h-6 w-px bg-hairline" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {CANVAS_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={cn(
                "h-5 w-5 rounded-full ring-offset-1 transition-transform hover:scale-110",
                color === c ? "ring-2 ring-white/70" : "ring-1 ring-hairline",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-hairline" />

        <button
          type="button"
          title="Delete selected"
          aria-label="Delete selected"
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) deleteShape(selectedId);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconTrash size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-hairline" />

        <button
          type="button"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          disabled={undoStackRef.current.length === 0}
          onClick={undo}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconArrowBackUp size={18} />
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          disabled={redoStackRef.current.length === 0}
          onClick={redo}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconArrowForwardUp size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-hairline" />

        <div className="relative">
          <button
            type="button"
            title="Export"
            aria-label="Export"
            disabled={shapes.length === 0}
            onClick={() => setExportOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <IconDownload size={18} />
          </button>
          {exportOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setExportOpen(false)}
              />
              <div className="absolute left-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-lg border border-hairline bg-elevated p-1 shadow-glow-sm">
                <button
                  type="button"
                  onClick={() => {
                    void import("./canvas-export").then((m) =>
                      m.exportPng(shapes),
                    );
                    setExportOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-ink hover:bg-white/[0.04]"
                >
                  <IconPhoto size={16} className="text-ink-faint" />
                  PNG image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void import("./canvas-export").then((m) =>
                      m.exportSvg(shapes),
                    );
                    setExportOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-ink hover:bg-white/[0.04]"
                >
                  <IconDownload size={16} className="text-ink-faint" />
                  SVG vector
                </button>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Presence */}
          {presence.length > 0 && (
            <div className="flex -space-x-2">
              {presence.slice(0, 5).map((p) => (
                <img
                  key={p.user_id}
                  src={avatarUrl(p.display_name)}
                  alt={p.display_name}
                  title={
                    you && p.user_id === you.user_id
                      ? `${p.display_name} (you)`
                      : p.display_name
                  }
                  className="h-7 w-7 rounded-full border-2 border-elevated bg-surface"
                />
              ))}
              {presence.length > 5 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-elevated bg-surface text-[10px] font-semibold text-ink-muted">
                  +{presence.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Connection status */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted"
            title={`Realtime: ${status}`}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "open" && "animate-soft-pulse bg-emerald-500",
                status === "connecting" && "bg-amber-400",
                (status === "closed" || status === "error") && "bg-rose-400",
                status === "idle" && "bg-ink-faint",
              )}
            />
            v{version}
          </span>
        </div>
      </div>

      {/* Stencil rail + canvas surface */}
      <div className="flex min-h-0 flex-1">
        <StencilRail
          activeVariant={tool === "component" ? componentVariant : null}
          onPick={(v) => {
            setComponentVariant(v);
            setTool("component");
            setSelectedId(null);
          }}
        />
        <div
          ref={containerRef}
          className={cn(
            "relative flex-1 overflow-hidden surface-dots",
            cursorClass,
          )}
        >
        <svg
          ref={svgRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <defs>
            {CANVAS_COLORS.map((c) => (
              <marker
                key={c}
                id={`arrow-${c.replace("#", "")}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10z" fill={c} />
              </marker>
            ))}
          </defs>

          <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
            {rendered
              .filter(
                (s) => !(editing && editing.id === s.id && s.type === "text"),
              )
              .map((s) => (
                <ShapeView
                  key={s.id}
                  shape={s}
                  selected={s.id === selectedId}
                  index={byId}
                  linked={s.id === linkTargetId}
                  editingId={editing?.id ?? null}
                />
              ))}

            {selected && <SelectionOverlay shape={selected} index={byId} />}
          </g>
        </svg>

        {/* Remote cursors */}
        {Object.entries(cursors).map(([uid, c]) => {
          const s = toScreen(c.x, c.y);
          return (
            <RemoteCursorView
              key={uid}
              x={s.x}
              y={s.y}
              name={c.name}
              color={colorForUser(uid)}
            />
          );
        })}

        {/* Inline text editor */}
        {editing && (
          <input
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape") {
                setEditing(null);
                setEditText("");
              }
            }}
            placeholder="Type…"
            className="absolute z-20 min-w-[120px] rounded border border-accent/40 bg-elevated px-1.5 py-0.5 text-base text-ink outline-none"
            style={{
              left: toScreen(editing.x, editing.y).x,
              top: toScreen(editing.x, editing.y).y,
              color,
            }}
          />
        )}

        {/* Empty hint */}
        {rendered.length === 0 && !editing && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <p className="font-semibold text-ink-muted">
              Your canvas is live — start designing
            </p>
            <p className="max-w-xs text-sm text-ink-faint">
              Drop system-design components from the left rail, then connect them
              with arrows. Everything syncs and persists in real time.
            </p>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-0.5 rounded-lg border border-hairline bg-surface/80 p-1 backdrop-blur">
          <button
            type="button"
            title="Zoom out"
            onClick={() => zoomFromCenter(1 / 1.2)}
            className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-white/[0.06]"
          >
            <IconMinus size={16} />
          </button>
          <button
            type="button"
            title="Reset zoom"
            onClick={() => setView({ x: 0, y: 0, scale: 1 })}
            className="min-w-[3rem] rounded px-1 py-1 text-xs font-medium text-ink-muted hover:bg-white/[0.06]"
          >
            {Math.round(view.scale * 100)}%
          </button>
          <button
            type="button"
            title="Zoom in"
            onClick={() => zoomFromCenter(1.2)}
            className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-white/[0.06]"
          >
            <IconPlus size={16} />
          </button>
          <div className="mx-0.5 h-5 w-px bg-hairline" />
          <button
            type="button"
            title="Fit to content"
            onClick={fitToContent}
            className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-white/[0.06]"
          >
            <IconMaximize size={16} />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

function ShapeView({
  shape,
  selected,
  index,
  linked,
  editingId,
}: {
  shape: Shape;
  selected: boolean;
  index: Map<string, Shape>;
  linked: boolean;
  editingId: string | null;
}) {
  const sw = selected ? 3 : 2.5;
  if (shape.type === "rect") {
    const n = normalize(shape);
    return (
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={8}
        fill={`${shape.color}14`}
        stroke={shape.color}
        strokeWidth={sw}
      />
    );
  }
  if (shape.type === "ellipse") {
    const n = normalize(shape);
    return (
      <ellipse
        cx={n.x + n.w / 2}
        cy={n.y + n.h / 2}
        rx={n.w / 2}
        ry={n.h / 2}
        fill={`${shape.color}14`}
        stroke={shape.color}
        strokeWidth={sw}
      />
    );
  }
  if (shape.type === "arrow") {
    const { x1, y1, x2, y2 } = resolveArrow(shape, index);
    const label = shape.text?.trim();
    const showLabel = label && shape.id !== editingId;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const lw = Math.max(24, label ? label.length * 7 + 14 : 0);
    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={shape.color}
          strokeWidth={sw}
          strokeLinecap="round"
          markerEnd={`url(#arrow-${shape.color.replace("#", "")})`}
        />
        {showLabel && (
          <>
            <rect
              x={mx - lw / 2}
              y={my - 10}
              width={lw}
              height={20}
              rx={6}
              fill="#12151B"
              stroke={shape.color}
              strokeOpacity={0.5}
            />
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={600}
              className="select-none fill-ink"
            >
              {label}
            </text>
          </>
        )}
      </g>
    );
  }
  if (shape.type === "component") {
    const n = normalize(shape);
    const stencil = stencilFor(shape.variant);
    const Icon = stencil.icon;
    return (
      <g>
        {linked && (
          <rect
            x={n.x - 4}
            y={n.y - 4}
            width={n.w + 8}
            height={n.h + 8}
            rx={14}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={3}
          />
        )}
        <rect
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={12}
          fill="#161A22"
          stroke={shape.color}
          strokeWidth={sw}
        />
        <rect
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={12}
          fill={`${shape.color}0f`}
        />
        <foreignObject
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
            <Icon size={26} color={shape.color} stroke={1.8} />
            <span className="text-[11px] font-semibold leading-tight text-ink">
              {shape.text}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  }
  return (
    <text
      x={shape.x}
      y={shape.y}
      dominantBaseline="hanging"
      className="select-none"
      fontSize={18}
      fontWeight={600}
      fill={shape.color}
    >
      {shape.text}
    </text>
  );
}

function SelectionOverlay({
  shape,
  index,
}: {
  shape: Shape;
  index: Map<string, Shape>;
}) {
  const boundArrow = shape.type === "arrow" && Boolean(shape.fromId || shape.toId);
  let x: number;
  let y: number;
  let w: number;
  let h: number;
  let handleX: number;
  let handleY: number;
  if (shape.type === "arrow") {
    const { x1, y1, x2, y2 } = resolveArrow(shape, index);
    x = Math.min(x1, x2);
    y = Math.min(y1, y2);
    w = Math.abs(x2 - x1);
    h = Math.abs(y2 - y1);
    handleX = x2;
    handleY = y2;
  } else {
    const n = normalize(shape);
    x = n.x;
    y = n.y;
    w = shape.type === "text" ? Math.max(n.w, 40) : n.w;
    h = shape.type === "text" ? Math.max(n.h, 22) : n.h;
    handleX = x + w;
    handleY = y + h;
  }
  const showHandle = shape.type !== "text" && !boundArrow;
  return (
    <g className="pointer-events-none">
      <rect
        x={x - 5}
        y={y - 5}
        width={w + 10}
        height={h + 10}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        rx={6}
      />
      {showHandle && (
        <rect
          x={handleX - 5}
          y={handleY - 5}
          width={10}
          height={10}
          fill="#0A0C10"
          stroke="#2dd4bf"
          strokeWidth={1.5}
          rx={2}
        />
      )}
    </g>
  );
}

function RemoteCursorView({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-y-1 transition-transform duration-75"
      style={{ left: x, top: y }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3l5.5 15 2.3-6.2 6.2-2.3L5 3z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="ml-3 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}

function StencilRail({
  activeVariant,
  onPick,
}: {
  activeVariant: ComponentVariant | null;
  onPick: (v: ComponentVariant) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? STENCILS.filter(
        (s) =>
          s.label.toLowerCase().includes(q) || s.variant.includes(q),
      )
    : STENCILS;

  return (
    <div className="flex w-[100px] shrink-0 flex-col border-r border-hairline bg-elevated">
      <div className="sticky top-0 z-10 space-y-1.5 bg-elevated px-2 pb-1.5 pt-2">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Components
        </span>
        <div className="relative">
          <IconSearch
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md border border-hairline bg-surface py-1 pl-6 pr-1.5 text-xs text-ink outline-none placeholder:text-ink-faint focus:border-accent/40"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-1.5 pb-3">
        {filtered.map((s) => {
          const Icon = s.icon;
          const active = activeVariant === s.variant;
          return (
            <button
              key={s.variant}
              type="button"
              title={`Add ${s.label}`}
              aria-pressed={active}
              onClick={() => onPick(s.variant)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors",
                active
                  ? "border-accent/40 bg-accent/10"
                  : "border-transparent hover:bg-white/[0.04]",
              )}
            >
              <Icon size={20} color={s.color} stroke={1.8} />
              <span className="text-[10px] font-medium leading-tight text-ink-muted">
                {s.label}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-1 pt-3 text-center text-[10px] text-ink-faint">
            No components match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
