import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { startSession, remaining, status, cancel } from "../lib/timer.js";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const POMODORO = 25 * MINUTE;

describe("startSession", () => {
  test("starts now and ends after the duration", () => {
    const session = startSession(POMODORO, 0);
    assert.deepEqual(session, { startedAt: 0, endsAt: POMODORO });
  });

  test("works when now is not zero", () => {
    const session = startSession(POMODORO, 5 * SECOND);
    assert.deepEqual(session, {
      startedAt: 5 * SECOND,
      endsAt: 5 * SECOND + POMODORO,
    });
  });
});

describe("remaining", () => {
  test("is the full duration at start", () => {
    const session = startSession(POMODORO, 0);
    assert.equal(remaining(session, 0), POMODORO);
  });

  test("goes down as time passes", () => {
    const session = startSession(POMODORO, 0);
    assert.equal(remaining(session, 3 * SECOND), POMODORO - 3 * SECOND);
  });

  test("is 0 exactly at the end", () => {
    const session = startSession(POMODORO, 0);
    assert.equal(remaining(session, POMODORO), 0);
  });

  test("is never negative after the end", () => {
    const session = startSession(POMODORO, 0);
    assert.equal(remaining(session, POMODORO * 2), 0);
  });

  test("is 0 for a cancelled session", () => {
    const session = cancel(startSession(POMODORO, 0), 10 * MINUTE);
    assert.equal(remaining(session, 10 * MINUTE), 0);
  });
});

describe("status", () => {
  test("is running 1ms before the end", () => {
    const session = startSession(POMODORO, 0);

    assert.equal(status(session, POMODORO - 1), "running");
  });

  test("is finished exactly at the end", () => {
    const session = startSession(POMODORO, 0);

    assert.equal(status(session, POMODORO), "finished");
  });

  test("stays finished after the end", () => {
    const session = startSession(POMODORO, 0);

    assert.equal(status(session, POMODORO * 2), "finished");
  });

  test("is cancelled after cancel", () => {
    const session = cancel(startSession(POMODORO, 0), 10 * MINUTE);

    assert.equal(status(session, 10 * MINUTE), "cancelled");
  });

  test("is cancelled when cancelled at now = 0", () => {
    const session = cancel(startSession(POMODORO, 0), 0);

    assert.equal(status(session, 0), "cancelled");
  });
});

describe("cancel", () => {
  test("records when it was cancelled", () => {
    const session = cancel(startSession(POMODORO, 0), 10 * MINUTE);

    assert.equal(session.cancelledAt, 10 * MINUTE);
  });

  test("does not mutate the original session", () => {
    const original = startSession(POMODORO, 0);

    cancel(original, 10 * MINUTE);

    assert.deepEqual(original, { startedAt: 0, endsAt: POMODORO });
  });

  test("does nothing to a finished session", () => {
    const session = startSession(POMODORO, 0);

    const result = cancel(session, POMODORO + MINUTE);

    assert.deepEqual(result, session);
    assert.equal(status(result, POMODORO + MINUTE), "finished");
  });

  test("keeps the first cancel time when cancelled twice", () => {
    const once = cancel(startSession(POMODORO, 0), 5 * MINUTE);

    const twice = cancel(once, 10 * MINUTE);

    assert.equal(twice.cancelledAt, 5 * MINUTE);
  });
});
