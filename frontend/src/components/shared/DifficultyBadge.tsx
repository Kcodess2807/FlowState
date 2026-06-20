import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/types";

const LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge variant={difficulty}>{LABEL[difficulty]}</Badge>;
}
