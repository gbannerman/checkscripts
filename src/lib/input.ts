const EXIT_KEYS = ["03", "1b"];
const CONTINUE_KEYS = ["20"];

export async function waitForInput() {
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.on("data", (data) => {
      const shouldContinue = CONTINUE_KEYS.includes(data.toString("hex"));
      const shouldExit = EXIT_KEYS.includes(data.toString("hex"));
      if (shouldContinue) {
        process.stdin.setRawMode(false);
        process.stdin.removeAllListeners("data");
        resolve();
      } else if (shouldExit) {
        console.log("❗️ Exited");
        process.exit();
      }
    })
  );
}
