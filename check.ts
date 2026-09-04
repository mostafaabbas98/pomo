import path from "node:path";
import { readFile } from "node:fs/promises";
import { parseSession } from "./session.ts";

const [argPath] = process.argv.slice(2);

if (argPath) {
  try {
    const filePath = path.join(import.meta.dirname, argPath);
    const rawSessions = await readFile(filePath, "utf8");

    let sessions;
    let parsedOk = true;
    try {
      sessions = JSON.parse(rawSessions);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `pomo: invalid JSON in file "${filePath}": ${error.message}`,
        );
        process.exitCode = 1;
        parsedOk = false;
      }
    }

    if (parsedOk && !Array.isArray(sessions)) {
      console.error(
        `pomo: expected an array of sessions in file "${filePath}", got ${typeof sessions}`,
      );
      process.exitCode = 1;
      parsedOk = false;
    }

    if (parsedOk) {
      const validSessions: unknown[] = sessions;
      validSessions.forEach((session, index) => {
        const result = parseSession(session);
        if (!result.ok) {
          console.error(
            `pomo: invalid session at index ${index} in file "${filePath}": ${result.errors.join(", ")}`,
          );
          process.exitCode = 1;
        }
      });
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      throw error;
    }
  }
} else {
  console.error(`pomo: missing path argument`);
  process.exitCode = 1;
}
