import type { CanvasOperation, OperationType, Shape } from "@/types/canvas";

export type ShapeMap = Map<string, Shape>;

/** Apply a single operation to a shape map (mutates and returns it). */
export function applyOperation(
  map: ShapeMap,
  type: OperationType,
  payload: Record<string, unknown>,
): ShapeMap {
  switch (type) {
    case "create_shape": {
      const shape = payload as unknown as Shape;
      if (shape && typeof shape.id === "string") {
        map.set(shape.id, { ...shape });
      }
      break;
    }
    case "move_shape":
    case "resize_shape": {
      const id = payload.id as string | undefined;
      if (id && map.has(id)) {
        const prev = map.get(id)!;
        map.set(id, { ...prev, ...(payload as Partial<Shape>), id });
      }
      break;
    }
    case "delete_shape": {
      const id = payload.id as string | undefined;
      if (id) map.delete(id);
      break;
    }
  }
  return map;
}

/** Fold a list of operations onto an existing map (in version order). */
export function applyOperations(
  map: ShapeMap,
  operations: CanvasOperation[],
): ShapeMap {
  const ordered = [...operations].sort((a, b) => a.version - b.version);
  for (const op of ordered) applyOperation(map, op.type, op.payload);
  return map;
}

/** Build a fresh map from a full operation log. */
export function buildShapeMap(operations: CanvasOperation[]): ShapeMap {
  return applyOperations(new Map(), operations);
}
