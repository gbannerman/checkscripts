import logUpdate from "log-update";
import {
  useOutput,
  withLoadingSpinner,
  withWaitForSpacebarPressed,
} from "./output.js";

enum CheckscriptStepType {
  MANUAL,
  AUTOMATED,
}

export enum CheckscriptMode {
  RUN,
  DOCUMENT,
}

export function checkscript<Context extends {}>(
  name: string,
  description: string,
  context: Context
) {
  return new Checkscript<Context>(name, description, context);
}

export interface CheckscriptStep<Context> {
  name: string;
  type: CheckscriptStepType;
  action: CheckscriptStepAction<Context>;
}

export interface DocumentCheckscriptOptions {
  includeFooter: boolean;
}

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

  private _run = async function (
    this: Checkscript<Context>,
    mode: CheckscriptMode
  ) {
    const { name, description, stepTitle, footer } = useOutput(mode);

    console.log(name(this.name));
    console.log(description(this.description));

    for (let stepNumber = 1; stepNumber <= this._steps.length; stepNumber++) {
      const step = this._steps[stepNumber - 1];
      const getStepHandler =
        mode === CheckscriptMode.DOCUMENT
          ? getDocumentStepHandler
          : getRunStepHandler;

      const stepHandler = getStepHandler(step.action);
      await stepHandler(this.context, stepTitle(stepNumber, step.name));
    }

    console.log(footer(this.name));

    process.exit();
  };

  run = async function (this: Checkscript<Context>) {
    this._run(CheckscriptMode.RUN);
  };

  document = async function (this: Checkscript<Context>) {
    this._run(CheckscriptMode.DOCUMENT);
  };
}

export function step<Context>(
  name: string,
  action: CheckscriptStepAction<Context>
) {
  const type = getStepType(action);

  return {
    name,
    type,
    action,
  };
}

function getDocumentStepHandler<Context>(
  action: CheckscriptStepAction<Context>
) {
  switch (typeof action) {
    case "string":
      return async (_context: Context, stepTitle: string) => {
        console.log(`\n## ${stepTitle}`);
        console.log(action);
      };
    case "function":
      return async (_context: Context, stepTitle: string) => {
        console.log(`\n## ${stepTitle}`);
        console.log("*[THIS IS AN AUTOMATED STEP]*");
      };
  }
}

function getRunStepHandler<Context>(action: CheckscriptStepAction<Context>) {
  switch (typeof action) {
    case "string":
      return (_context: Context, stepTitle: string) =>
        manualStep(stepTitle, action);
    case "function":
      return (context: Context, stepTitle: string) =>
        automatedStep(context, stepTitle, action);
  }
}

function getStepType<Context>(action: CheckscriptStepAction<Context>) {
  switch (typeof action) {
    case "string":
      return CheckscriptStepType.MANUAL;
    case "function":
      return CheckscriptStepType.AUTOMATED;
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
