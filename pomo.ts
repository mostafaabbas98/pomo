import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SESSION_MINUTES, formatTime } from "./timer.ts";
import { type Session, parseSession } from "./session.ts";

const [command = "start", rawMinutes] = process.argv.slice(2);

if (command !== "start") {
  console.error(`pomo: unknown command "${command}"`);
  console.error("usage: pomo start [minutes]");
  process.exitCode = 2;
} else {
  const minutes = Number(
    rawMinutes ?? process.env.POMO_MINUTES ?? SESSION_MINUTES,
  );

  if (!Number.isInteger(minutes) || minutes <= 0) {
    console.error(
      `pomo: minutes must be a positive integer, got "${rawMinutes}"`,
    );
    process.exitCode = 1;
  } else {
    const totalSeconds = minutes * 60;
    const deadLine = Date.now() + totalSeconds * 1000;
    const startedAt = new Date().toISOString();

    process.stderr.write(
      `pomo: ${formatTime(totalSeconds)} session, starting now\n`,
    );

    const t = setInterval(async () => {
      const msLeft = deadLine - Date.now();

      if (msLeft > 0) {
        process.stderr.write(`${formatTime(Math.ceil(msLeft / 1000))}\r`);
        return;
      }

      clearInterval(t);

      try {
        let sessions;
        const filePath = path.join(import.meta.dirname, "sessions.json");

        try {
          const rawSessions = await readFile(filePath, "utf8");
          try {
            sessions = JSON.parse(rawSessions);
          } catch (error) {
            console.error(
              `pomo: invalid JSON in file "${filePath}": ${error instanceof Error ? error.message : error}`,
            );
            sessions = undefined;
          }
        } catch (error) {
          if (
            error instanceof Error &&
            "code" in error &&
            error.code !== "ENOENT"
          ) {
            throw error;
          }
        }

        let goodSessions: Session[];
        if (sessions === undefined) {
          goodSessions = [];
        } else if (!Array.isArray(sessions)) {
          console.error(
            `pomo: ignoring session file "${filePath}": expected an array, got ${typeof sessions}`,
          );
          goodSessions = [];
        } else {
          goodSessions = [];
          const validSessions: unknown[] = sessions;
          validSessions.forEach((session, index) => {
            const result = parseSession(session);
            if (result.ok) {
              goodSessions.push(result.value);
            } else {
              console.error(
                `pomo: ignoring invalid session at index ${index} in "${filePath}": ${result.errors.join(", ")}`,
              );
            }
          });
        }

        goodSessions.push({ minutes, startedAt });
        await writeFile(filePath, JSON.stringify(goodSessions, null, 2));
      } catch (error) {
        console.error(
          `pomo: failed to write session file: ${error instanceof Error ? error.message : error}`,
        );
        process.exitCode = 1;
        return;
      }

      process.stdout.write(`pomo: ${formatTime(totalSeconds)} session, done\n`);
    }, 1000);
  }
}
