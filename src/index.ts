import { checkscript, step } from "./lib/checkscript.js";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

checkscript(
  "GitHub Action Migration",
  "A script to assist in the migration of a project to GitHub Actions"
)
  .steps(
    step(
      "Checkout the git repository",
      "Run git clone git@github.com:administrate/{REPO_NAME}.git in your terminal"
    ),
    step("Do another thing", "Do this thing"),
    step("Do an automatic thing", async () => {
      await timeout(3000);
      return "Hello";
    }),
    step("End thing", "One more")
  )
  .steps(
    step(
      "Checkout the git repository",
      "Run git clone git@github.com:administrate/{REPO_NAME}.git in your terminal"
    ),
    step("Do another thing", "Do this thing"),
    step("End thing", "One more")
  )
  .run();
