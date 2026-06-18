import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/types";

const MAP: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge variant={MAP[difficulty]}>{difficulty}</Badge>;
}
