import { useFormat } from "./output.js";
import { getDocumentStepHandler, getRunStepHandler } from "./step.js";
import type { CheckscriptStep } from "./step.js";

export enum CheckscriptMode {
  RUN,
  DOCUMENT,
}

export function checkscript<Context extends Object = {}>(
  name: string,
  description: string,
  context: Context = {} as Context,
) {
  return new Checkscript<Context>(name, description, context);
}

export { step } from "./step.js";

interface DocumentCheckscriptOptions {
  includeFooter: boolean;
}

class Checkscript<Context extends Object> {
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
    this._runCheckscript(CheckscriptMode.RUN, true);
  };

  document = async function (
    this: Checkscript<Context>,
    options: DocumentCheckscriptOptions = { includeFooter: true },
  ) {
    this._runCheckscript(CheckscriptMode.DOCUMENT, options.includeFooter);
  };

  private _runCheckscript = async function (
    this: Checkscript<Context>,
    mode: CheckscriptMode,
    includeFooter: boolean,
  ) {
    const { name, description, stepTitle, footer } = useFormat(mode);

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

    if (includeFooter) {
      console.log(footer(this.name));
    }

    process.exit();
  };
}
