import logUpdate from "log-update";
import { withLoadingSpinner, withWaitForSpacebarPressed } from "./output.js";

enum CheckscriptStepType {
  MANUAL,
  AUTOMATED,
}

export interface CheckscriptStep<Context> {
  name: string;
  type: CheckscriptStepType;
  action: CheckscriptStepAction<Context>;
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

export function getDocumentStepHandler<Context>(
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

export function getRunStepHandler<Context>(
  action: CheckscriptStepAction<Context>
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
  context: Context
) => string | void | Promise<string | void>;

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
