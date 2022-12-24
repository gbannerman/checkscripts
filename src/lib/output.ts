import chalk from "chalk";
import logUpdate from "log-update";
import { waitForInput } from "./input.js";

const LOADING_FRAMES = ["-", "\\", "|", "/"];

export function checkscriptName(name: string) {
  const dividerLength = name.length + 6;
  return `${"-".repeat(dividerLength)}\n   ${chalk.bold(name)}\n${"-".repeat(
    dividerLength
  )}`;
}

export function checkscriptDescription(description: string) {
  return `${chalk.italic(description)}\n`;
}

export function checkscriptComplete(name: string) {
  return `\n✅ Complete: ${chalk.bold(name)}`;
}

export function stepTitle(stepNumber: number, name: string) {
  return chalk.bold(`${stepNumber}. ${name}`);
}

export async function withLoadingSpinner<T>(
  text: string,
  operation: () => Promise<T>
) {
  let index = 0;
  const interval = setInterval(() => {
    const frame = LOADING_FRAMES[(index = ++index % LOADING_FRAMES.length)];
    logUpdate(
      `
${frame} ${text}
      `
    );
  }, 80);

  const result = await operation();

  clearInterval(interval);

  return result;
}

export async function withWaitForSpacebarPressed(text: string) {
  logUpdate(
    `${text}
${chalk.dim("PRESS SPACEBAR TO CONTINUE")}
    `
  );

  await waitForInput();
}
