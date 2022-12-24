import logUpdate from "log-update";
import {
  checkscriptName,
  checkscriptDescription,
  checkscriptComplete,
  stepTitle,
  withLoadingSpinner,
  withWaitForSpacebarPressed,
} from "./output.js";

export function checkscript(name: string, description: string) {
  return new Checkscript(name, description);
}

type CheckscriptStep = (stepNumber: number) => Promise<void>;

type CheckscriptStepAction =
  | ManualCheckscriptStepAction
  | AutomatedCheckscriptStepAction;

class Checkscript {
  private _steps: CheckscriptStep[];
  private name: string;
  private description: string;

  constructor(name: string, description: string) {
    this._steps = [];
    this.name = name;
    this.description = description;
  }

  steps = function (this: Checkscript, ...steps: CheckscriptStep[]) {
    this._steps = [...this._steps, ...steps];
    return this;
  };

  run = async function (this: Checkscript) {
    console.log(checkscriptName(this.name));
    console.log(checkscriptDescription(this.description));

    for (let stepNumber = 1; stepNumber < this._steps.length; stepNumber++) {
      const step = this._steps[stepNumber - 1];
      await step(stepNumber);
    }

    console.log(checkscriptComplete(this.name));
    process.exit();
  };
}

export function step(name: string, action: CheckscriptStepAction) {
  const stepHandler = getStepHandler(action);

  return async function (stepNumber: number) {
    await stepHandler(stepTitle(stepNumber, name));
  };
}

function getStepHandler(action: CheckscriptStepAction) {
  switch (typeof action) {
    case "string":
      return (stepTitle: string) => manualStep(stepTitle, action);
    case "function":
      return (stepTitle: string) => automatedStep(stepTitle, action);
  }
}

type AutomatedCheckscriptStepAction = () => Promise<string | void>;

async function automatedStep(
  stepTitle: string,
  action: AutomatedCheckscriptStepAction
) {
  const text = await withLoadingSpinner(stepTitle, () => action());

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
