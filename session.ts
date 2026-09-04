export type Phase =
  | { type: "idle" }
  | { type: "running"; deadline: number }
  | { type: "done"; runFor: number };

export type Session = { minutes: number; startedAt: string };

export type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

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

export function parseSession(value: unknown): Parsed<Session> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, errors: ["expected an object"] };
  }

  const errors: string[] = [];
  let minutes: number | undefined;
  let startedAt: string | undefined;

  if (!("minutes" in value)) errors.push("minutes: missing");
  else if (typeof value.minutes !== "number")
    errors.push(`minutes: expected a number, got ${typeof value.minutes}`);
  else if (!Number.isInteger(value.minutes) || value.minutes <= 0)
    errors.push(
      `minutes: expected a positive whole number, got ${value.minutes}`,
    );
  else minutes = value.minutes;

  if (!("startedAt" in value)) errors.push("startedAt: missing");
  else if (typeof value.startedAt !== "string")
    errors.push(`startedAt: expected a string, got ${typeof value.startedAt}`);
  else startedAt = value.startedAt;

  if (minutes === undefined || startedAt === undefined)
    return { ok: false, errors };

  return { ok: true, value: { minutes, startedAt } };
}

export function isSession(value: unknown): value is Session {
  return parseSession(value).ok;
}
