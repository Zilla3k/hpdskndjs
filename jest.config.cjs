const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: "<rootDir>/",
  }),
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/generated/**", "!src/**/*.d.ts"],
};
