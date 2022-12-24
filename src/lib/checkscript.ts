import logUpdate from "log-update";
import {
  checkscriptName,
  checkscriptDescription,
  checkscriptComplete,
  stepTitle,
  withLoadingSpinner,
  withWaitForSpacebarPressed,
} from "./output.js";

export function checkscript<Context extends {}>(
  name: string,
  description: string,
  context: Context
) {
  return new Checkscript<Context>(name, description, context);
}

type CheckscriptStep<Context> = (
  context: Context,
  stepNumber: number
) => Promise<void>;

type CheckscriptStepAction<Context> =
  | ManualCheckscriptStepAction
  | AutomatedCheckscriptStepAction<Context>;

class Checkscript<Context extends {}> {
  private _steps: CheckscriptStep<Context>[];
  private name: string;
  private description: string;
  private context: Context;

  constructor(name: string, description: string, context: Context) {
    this._steps = [];
    this.name = name;
    this.description = description;
    this.context = context;
  }

  steps = function (
    this: Checkscript<Context>,
    ...steps: CheckscriptStep<Context>[]
  ) {
    this._steps = [...this._steps, ...steps];
    return this;
  };

  run = async function (this: Checkscript<Context>) {
    console.log(checkscriptName(this.name));
    console.log(checkscriptDescription(this.description));

    for (let stepNumber = 1; stepNumber <= this._steps.length; stepNumber++) {
      const step = this._steps[stepNumber - 1];
      await step(this.context, stepNumber);
    }

    console.log(checkscriptComplete(this.name));
    process.exit();
  };
}

export function step<Context>(
  name: string,
  action: CheckscriptStepAction<Context>
) {
  const stepHandler = getStepHandler(action);

  return async function (context: Context, stepNumber: number) {
    await stepHandler(context, stepTitle(stepNumber, name));
  };
}

function getStepHandler<Context>(action: CheckscriptStepAction<Context>) {
  switch (typeof action) {
    case "string":
      return (_context: Context, stepTitle: string) =>
        manualStep(stepTitle, action);
    case "function":
      return (context: Context, stepTitle: string) =>
        automatedStep(context, stepTitle, action);
  }
}

type AutomatedCheckscriptStepAction<Context> = (
  context: Context
) => Promise<string | void>;

async function automatedStep<Context>(
  context: Context,
  stepTitle: string,
  action: AutomatedCheckscriptStepAction<Context>
) {
  const text = await withLoadingSpinner(stepTitle, () => action(context));

  logUpdate(
    `
✓ ${stepTitle}
${text ?? ""}
`
  );

  logUpdate.done();
}

type ManualCheckscriptStepAction = string;

async function manualStep(
  stepTitle: string,
  action: ManualCheckscriptStepAction
) {
  await withWaitForSpacebarPressed(
    `
➤ ${stepTitle}
${action}`
  );

  logUpdate(
    `
✓ ${stepTitle}
${action}
    `
  );

  logUpdate.done();
}
