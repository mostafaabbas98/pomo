import { SESSION_MINUTES, formatTime } from "./timer.js";

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

    process.stderr.write(
      `pomo: ${formatTime(totalSeconds)} session, starting now\n`,
    );

    const t = setInterval(() => {
      const msLeft = deadLine - Date.now();

      if (msLeft <= 0) {
        clearInterval(t);
        process.stdout.write(
          `pomo: ${formatTime(totalSeconds)} session, done\n`,
        );
        return;
      }

      const secondsLeft = Math.ceil(msLeft / 1000);
      process.stderr.write(`${formatTime(secondsLeft)}\r`);
    }, 1000);
  }
}
