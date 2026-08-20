import { SESSION_MINUTES, formatTime } from "./timer.js";

const [command = "start", rawMinutes] = process.argv.slice(2);

const minutes = Number(rawMinutes ?? process.env.POMO_MINUTES ?? SESSION_MINUTES);

if (command !== "start") {
	console.error(`pomo: unknown command "${command}"`);
	console.error("usage: pomo start [minutes]");
	process.exitCode = 2;
} else if (!Number.isInteger(minutes) || minutes <= 0) {
	console.error(`pomo: minutes must be a positive integer, got "${rawMinutes}"`);
	process.exitCode = 1;
} else {
	console.log(`pomo: ${formatTime(minutes * 60)} session, starting now`);
}
