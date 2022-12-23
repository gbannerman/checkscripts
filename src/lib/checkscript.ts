// export type Checkscript<T> = (name: string, handler: Function) => T;
import chalk from "chalk";
import logUpdate from "log-update";

const LOADING_FRAMES = ["-", "\\", "|", "/"];

export function checkscript(name: string, description: string) {
  return new Checkscript(name, description);
}

class Checkscript {
  private _steps: any[];
  private name: string;
  private description: string;

  constructor(name: string, description: string) {
    this._steps = [];
    this.name = name;
    this.description = description;
  }

  steps = function (this: Checkscript, steps: any[]) {
    this._steps = [...this._steps, ...steps];
    return this;
  };

  run = async function (this: Checkscript) {
    console.log(
      `---------------------------\n${chalk.bold(
        this.name
      )}\n---------------------------`
    );
    console.log(`${this.description}\n`);

    for (let stepNumber = 1; stepNumber < this._steps.length; stepNumber++) {
      const step = this._steps[stepNumber - 1];
      await step(stepNumber);
    }

    console.log(`✅ Complete: ${chalk.bold(this.name)}`);
    process.exit();
  };
}

export function step(name: string, action: string | Function) {
  const stepAction = getActionHandler(action);
  return async function (stepNumber: number) {
    const stepTitle = chalk.bold(`${stepNumber}. ${name}`);
    await stepAction(stepTitle, action as any);
  };
}

function getActionHandler(action: string | Function) {
  switch (typeof action) {
    case "string":
      return manualStep;
    case "function":
      return automatedStep;
  }
}

async function automatedStep(stepTitle: string, action: Function) {
  logUpdate(`${stepTitle}\n`);
  let index = 0;
  const interval = setInterval(() => {
    const frame = LOADING_FRAMES[(index = ++index % LOADING_FRAMES.length)];
    logUpdate(`${frame} ${stepTitle}`);
  }, 80);
  const text = await action();
  clearInterval(interval);
  logUpdate(`✓ ${stepTitle}\n${text ?? ""}\n`);
  logUpdate.done();
}

async function manualStep(stepTitle: string, action: string) {
  logUpdate(
    `➤ ${stepTitle}\n`,
    `${action}\n`,
    chalk.dim("PRESS SPACEBAR TO CONTINUE")
  );

  await keypress();

  logUpdate(`✓ ${stepTitle}\n`, `${action}\n`);

  logUpdate.done();
}

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.on("data", (data) => {
      const shouldContinue = data.toString("hex") === "20";
      if (shouldContinue) {
        process.stdin.setRawMode(false);
        process.stdin.removeAllListeners("data");
        resolve();
      }
    })
  );
};
