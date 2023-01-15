import { jest } from "@jest/globals";
import { stdin as mockStdIn } from "mock-stdin";
import { waitForInput } from "../lib/input.js";

const KEYS = {
  ESCAPE: "\u001B",
  CTRL_C: "\u0003",
  SPACEBAR: "\u0020",
};

const stdin = mockStdIn();

describe("waitForInput", () => {
  it("resolves when spacebar is pressed", async () => {
    const delay = waitForInput();

    stdin.send(KEYS.SPACEBAR, "utf8");

    await expect(delay).resolves.not.toThrow();
  });

  it("resolves when spacebar is pressed", async () => {
    const delay = waitForInput();

    stdin.send(KEYS.SPACEBAR, "utf8");

    await expect(delay).resolves.not.toThrow();
  });

  describe("exits the process", () => {
    let mockExitProcess: jest.SpiedFunction<
      (code?: number | undefined) => never
    >;
    let mockConsoleLog: jest.SpiedFunction<(message?: string) => void>;

    beforeEach(() => {
      mockExitProcess = jest
        .spyOn(process, "exit")
        .mockImplementationOnce((() => {}) as (
          code?: number | undefined
        ) => never);
      mockConsoleLog = jest
        .spyOn(console, "log")
        .mockImplementationOnce(() => {});
    });

    afterEach(() => {
      mockExitProcess.mockReset();
      mockConsoleLog.mockReset();
    });

    it("when escape key is pressed", async () => {
      waitForInput();

      stdin.send(KEYS.ESCAPE, "utf8");

      expect(mockExitProcess).toHaveBeenCalled();
    });

    it("when control and c keys are pressed", async () => {
      waitForInput();

      stdin.send(KEYS.CTRL_C, "utf8");

      expect(mockExitProcess).toHaveBeenCalled();
    });

    it("logs that the process was exited", async () => {
      waitForInput();

      stdin.send(KEYS.CTRL_C, "utf8");

      expect(mockConsoleLog).toHaveBeenCalledWith("❗️ Exited");
    });
  });
});
