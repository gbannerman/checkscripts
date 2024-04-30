import chalk from "chalk";
import logUpdate from "log-update";
import { CheckscriptMode } from "./checkscript.js";
import { waitForInput } from "./input.js";

const LOADING_FRAMES = ["-", "\\", "|", "/"];

export function useFormat(mode: CheckscriptMode) {
  return mode === CheckscriptMode.DOCUMENT
    ? {
        name: (name: string) => `# ${name}`,
        description: (description: string) => `*${description}*`,
        stepTitle: (stepNumber: number, name: string) =>
          `${stepNumber}. ${name}`,
        footer: () => `
---
*This document is a [checkscript](). It can be run using JavaScript.*
            `,
      }
    : {
        name: (name: string) => {
          const dividerLength = name.length + 6;
          return `${"-".repeat(dividerLength)}\n   ${chalk.bold(
            name,
          )}\n${"-".repeat(dividerLength)}`;
        },
        description: (description: string) => `${chalk.italic(description)}\n`,
        stepTitle: (stepNumber: number, name: string) =>
          chalk.bold(`${stepNumber}. ${name}`),
        footer: (name: string) => `\n✅ Complete: ${chalk.bold(name)}`,
      };
}

export async function withLoadingSpinner<T>(
  text: string,
  operation: () => Promise<T> | T,
) {
  let index = 0;
  const interval = setInterval(() => {
    const frame = LOADING_FRAMES[(index = ++index % LOADING_FRAMES.length)];
    logUpdate(
      `
${frame} ${text}
      `,
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
    `,
  );

  await waitForInput();
}
