const EXIT_KEYS = ["\u001B", "\u0003"];
const CONTINUE_KEYS = ["\u0020"];

export async function waitForInput() {
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.on("data", (data) => {
      const shouldContinue = CONTINUE_KEYS.includes(data.toString("utf8"));
      const shouldExit = EXIT_KEYS.includes(data.toString("utf8"));
      if (shouldContinue) {
        process.stdin.setRawMode(false);
        process.stdin.removeAllListeners("data");
        resolve();
      } else if (shouldExit) {
        console.log("❗️ Exited");
        process.exit();
      }
    }),
  );
}
