import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Shape } from "@/types/canvas";
import { CANVAS_COLORS } from "@/types/canvas";
import { stencilFor } from "./stencils";
import { normalize, resolveArrow } from "./FlowCanvas";

const PAD = 48;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function bounds(shapes: Shape[]): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
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
  return { minX, minY, maxX, maxY };
}

function shapeToSvg(s: Shape, index: Map<string, Shape>): string {
  if (s.type === "arrow") {
    const { x1, y1, x2, y2 } = resolveArrow(s, index);
    const marker = `url(#arrow-${s.color.replace("#", "")})`;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" marker-end="${marker}"/>`;
    const label = s.text?.trim();
    if (!label) return line;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const lw = Math.max(24, label.length * 7 + 14);
    return [
      line,
      `<rect x="${mx - lw / 2}" y="${my - 10}" width="${lw}" height="20" rx="6" fill="#ffffff" stroke="${s.color}" stroke-opacity="0.4"/>`,
      `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#334155">${esc(label)}</text>`,
    ].join("");
  }
  if (s.type === "rect") {
    const n = normalize(s);
    return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8" fill="${s.color}" fill-opacity="0.08" stroke="${s.color}" stroke-width="2.5"/>`;
  }
  if (s.type === "ellipse") {
    const n = normalize(s);
    return `<ellipse cx="${n.x + n.w / 2}" cy="${n.y + n.h / 2}" rx="${n.w / 2}" ry="${n.h / 2}" fill="${s.color}" fill-opacity="0.08" stroke="${s.color}" stroke-width="2.5"/>`;
  }
  if (s.type === "text") {
    return `<text x="${s.x}" y="${s.y}" dominant-baseline="hanging" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="${s.color}">${esc(s.text ?? "")}</text>`;
  }
  // component
  const n = normalize(s);
  const stencil = stencilFor(s.variant);
  const icon = renderToStaticMarkup(
    createElement(stencil.icon, { size: 26, color: s.color, stroke: 1.8 }),
  );
  const cx = n.x + n.w / 2;
  const iconX = cx - 13;
  const iconY = n.y + n.h / 2 - 26;
  const labelY = n.y + n.h / 2 + 16;
  return [
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="#ffffff" stroke="${s.color}" stroke-width="2.5"/>`,
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="${s.color}" fill-opacity="0.06"/>`,
    `<g transform="translate(${iconX},${iconY})">${icon}</g>`,
    `<text x="${cx}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#334155">${esc(s.text ?? "")}</text>`,
  ].join("");
}

export function buildSvg(shapes: Shape[]): {
  svg: string;
  width: number;
  height: number;
} {
  const b = bounds(shapes);
  const width = Math.max(b.maxX - b.minX + PAD * 2, 1);
  const height = Math.max(b.maxY - b.minY + PAD * 2, 1);
  const index = new Map(shapes.map((s) => [s.id, s]));

  const defs = CANVAS_COLORS.map(
    (c) =>
      `<marker id="arrow-${c.replace("#", "")}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`,
  ).join("");

  const body = shapes.map((s) => shapeToSvg(s, index)).join("");
  const tx = -b.minX + PAD;
  const ty = -b.minY + PAD;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs><rect width="${width}" height="${height}" fill="#ffffff"/><g transform="translate(${tx},${ty})">${body}</g></svg>`;

  return { svg, width, height };
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function exportSvg(shapes: Shape[]): void {
  if (shapes.length === 0) return;
  const { svg } = buildSvg(shapes);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "flowstate-diagram.svg");
  URL.revokeObjectURL(url);
}

export async function exportPng(shapes: Shape[], scale = 2): Promise<void> {
  if (shapes.length === 0) return;
  const { svg, width, height } = buildSvg(shapes);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.width = width;
    img.height = height;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to rasterize SVG"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    const pngUrl = canvas.toDataURL("image/png");
    triggerDownload(pngUrl, "flowstate-diagram.png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
