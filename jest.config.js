export default {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        verbatimModuleSyntax: false,
      },
    },
  },
};
