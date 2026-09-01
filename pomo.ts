import { readFile, writeFile } from "node:fs/promises";
import { SESSION_MINUTES, formatTime } from "./timer.ts";
import { type Session } from "./session.ts";

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
        let sessions: Session[] = [];

        try {
          const rawSessions = await readFile("sessions.json", "utf8");
          sessions = JSON.parse(rawSessions);
        } catch (error) {
          if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
          ) {
            throw error;
          }
        }
        sessions.push({ minutes, startedAt });
        await writeFile("sessions.json", JSON.stringify(sessions, null, 2));
      } catch (error) {
        if (error instanceof Error && "message" in error) {
          console.error(
            `pomo: failed to write session file: ${error instanceof Error ? error.message : error}`,
          );
        }
        process.exitCode = 1;
        return;
      }

      process.stdout.write(`pomo: ${formatTime(totalSeconds)} session, done\n`);
    }, 1000);
  }
}
