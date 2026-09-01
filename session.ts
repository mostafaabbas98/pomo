export type Phase =
  | { type: "idle" }
  | { type: "running"; deadline: number }
  | { type: "done"; runFor: number };

export type Session = { minutes: number; startedAt: string };

function showPhase(phase: Phase): string {
  switch (phase.type) {
    case "idle":
      return "idle";
    case "running":
      return `running for ${phase.deadline}`;
    case "done":
      return `done for ${phase.runFor}`;
    default:
      const impossible: never = phase;
      return impossible;
  }
}

function isSession(value: unknown): value is Session {
  return (
    typeof value === "object" &&
    value !== null &&
    "minutes" in value &&
    typeof value.minutes === "number" &&
    Number.isInteger(value.minutes) &&
    value.minutes > 0 &&
    "startedAt" in value &&
    typeof value.startedAt === "string"
  );
}
