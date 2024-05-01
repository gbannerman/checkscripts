import logUpdate from "log-update";
import { withLoadingSpinner, withWaitForSpacebarPressed } from "./output.js";

enum CheckscriptStepType {
  MANUAL,
  AUTOMATED,
}

export interface CheckscriptStep<Context> {
  name: string | null;
  type: CheckscriptStepType;
  action: CheckscriptStepAction<Context>;
}

export function step<Context>(
  description: TemplateStringsArray,
): CheckscriptStep<Context>;
export function step<Context>(
  name: string,
  action: ManualCheckscriptStepAction,
): CheckscriptStep<Context>;
export function step<Context>(
  name: string,
  action: AutomatedCheckscriptStepAction<Context>,
): CheckscriptStep<Context>;

export function step<Context>(
  initial: string | TemplateStringsArray,
  ...args:
    | ManualCheckscriptStepAction[]
    | AutomatedCheckscriptStepAction<Context>[]
): CheckscriptStep<Context> {
  if (typeof initial !== "string") {
    return {
      name: null,
      type: CheckscriptStepType.MANUAL,
      action: initial[0],
    };
  }

  const [action] = args;

  const type = getStepType(action);

  return {
    name: initial,
    type,
    action,
  };
}

export function getDocumentStepHandler<Context>(
  action: CheckscriptStepAction<Context>,
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

export function getRunStepHandler<Context>(
  action: CheckscriptStepAction<Context>,
) {
  switch (typeof action) {
    case "string":
      return (_context: Context, stepTitle: string) =>
        manualStep(stepTitle, action);
    case "function":
      return (context: Context, stepTitle: string) =>
        automatedStep(context, stepTitle, action);
  }
}

type CheckscriptStepAction<Context> =
  | ManualCheckscriptStepAction
  | AutomatedCheckscriptStepAction<Context>;

function getStepType<Context>(action: CheckscriptStepAction<Context>) {
  switch (typeof action) {
    case "string":
      return CheckscriptStepType.MANUAL;
    case "function":
      return CheckscriptStepType.AUTOMATED;
  }
}

type AutomatedCheckscriptStepAction<Context> = (
  context: Context,
) => string | void | Promise<string | void>;

async function automatedStep<Context>(
  context: Context,
  stepTitle: string,
  action: AutomatedCheckscriptStepAction<Context>,
) {
  const text = await withLoadingSpinner(stepTitle, () => action(context));

  logUpdate(
    `
✓ ${stepTitle}
${text ?? ""}
`,
  );

  logUpdate.done();
}

type ManualCheckscriptStepAction = string;

async function manualStep(
  stepTitle: string,
  action: ManualCheckscriptStepAction,
) {
  await withWaitForSpacebarPressed(
    `
➤ ${stepTitle}
${action}`,
  );

  logUpdate(
    `
✓ ${stepTitle}
${action}
    `,
  );

  logUpdate.done();
}
