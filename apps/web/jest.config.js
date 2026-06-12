const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const customJestConfig = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
    moduleNameMapper: {
        "^@rpv/domain$": "<rootDir>/../../packages/domain/src/index.ts",
    },
};

// next/jest overwrites `transformIgnorePatterns`, so apply our override after it
// runs. next-intl (and its use-intl/@formatjs deps) ship as ESM only and must be
// transformed by SWC rather than ignored.
module.exports = async () => {
    const config = await createJestConfig(customJestConfig)();

    config.transformIgnorePatterns = [
        "/node_modules/(?!(next-intl|use-intl|intl-messageformat|@formatjs|icu-minify|@schummar)/)",
        "^.+\\.module\\.(css|sass|scss)$",
    ];

    return config;
};
