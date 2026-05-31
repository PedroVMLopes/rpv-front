const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset({
    tsconfig: {
        baseUrl: ".",
        paths: {
            "@/*": ["./*"],
        },
    },
}).transform;

/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    transform: {
        ...tsJestTransformCfg,
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@rpv/domain$": "<rootDir>/../../packages/domain/src/index.ts",
    },
};
