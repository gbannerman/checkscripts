import { checkscript, step } from "./lib/checkscript.js";

function fakeApiCall(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

interface TestContext {
  fakeApiCall: (ms: number) => Promise<void>;
  fakeResult: string | null;
}

checkscript<TestContext>(
  "GitHub Action Migration",
  "A script to assist in the migration of a project to GitHub Actions",
  { fakeApiCall, fakeResult: null }
)
  .steps(
    step(
      "Checkout the git repository",
      "Run git clone git@github.com:administrate/{REPO_NAME}.git in your terminal"
    ),
    step("Do another thing", "Do this thing"),
    step("Do an automatic thing", async (context) => {
      await context.fakeApiCall(3000);
      context.fakeResult = "Result 1";
      return "Some result";
    }),
    step("End thing", "One more")
  )
  .steps(
    step(
      "Checkout the git repository",
      "Run git clone git@github.com:administrate/{REPO_NAME}.git in your terminal"
    ),
    step("Do another thing", "Do this thing"),
    step("End thing", "One more"),
    step("Finally", async (context) => {
      await context.fakeApiCall(3000);
      return `From previous step: ${context.fakeResult}`;
    })
  )
  .document();
