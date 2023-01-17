import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  testEnvironment: "node",
  preset: "ts-jest",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
};

export default config;
