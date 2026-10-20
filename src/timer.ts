export type Session = {
  startedAt: number;
  endsAt: number;
  cancelledAt?: number;
};
type SessionState = "running" | "finished" | "cancelled";

export function startSession(durationMs: number, now: number): Session {
  return {
    startedAt: now,
    endsAt: now + durationMs,
  };
}

export function remaining(session: Session, now: number): number {
  if (session.cancelledAt) {
    return 0;
  }
  return Math.max(0, session.endsAt - now);
}

export function status(session: Session, now: number): SessionState {
  if (session.cancelledAt !== undefined) {
    return "cancelled";
  }
  if (now >= session.endsAt) {
    return "finished";
  }
  return "running";
}

export function cancel(session: Session, now: number): Session {
  if (status(session, now) !== "running") return session;
  return {
    ...session,
    cancelledAt: now,
  };
}
