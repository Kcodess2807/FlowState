from copy import deepcopy
from typing import Any, Iterable

from app.models.operation import OperationType

Shape = dict[str, Any]
CanvasState = dict[str, Shape]


def apply_operation(
    state: CanvasState, op_type: str, payload: dict[str, Any]
) -> CanvasState:
    shape_id = payload.get("shape_id")

    if op_type == OperationType.create_shape.value:
        if shape_id is not None:
            state[shape_id] = dict(payload)

    elif op_type in (
        OperationType.move_shape.value,
        OperationType.resize_shape.value,
    ):
        if shape_id is not None and shape_id in state:
            updates = {k: v for k, v in payload.items() if k != "shape_id"}
            state[shape_id].update(updates)

    elif op_type == OperationType.delete_shape.value:
        if shape_id is not None:
            state.pop(shape_id, None)

    # unknown op types are ignored
    return state


def build_state(
    operations: Iterable[Any], base_state: CanvasState | None = None
) -> CanvasState:
    # deepcopy so a snapshot's stored state isn't mutated through the ORM object
    state: CanvasState = deepcopy(base_state) if base_state else {}
    for op in operations:
        apply_operation(state, op.op_type, op.payload)
    return state
