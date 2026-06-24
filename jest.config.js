/** @type {import('jest').Config} */
module.exports = {
    projects: [
        {
            displayName: "domain",
            preset: "ts-jest",
            testEnvironment: "node",
            roots: ["<rootDir>/packages/domain"],
            testMatch: ["**/__tests__/**/*.test.ts"],
            moduleFileExtensions: ["ts", "js"],
            transform: {
                "^.+\\.tsx?$": [
                    "ts-jest",
                    {
                        tsconfig: "<rootDir>/packages/domain/tsconfig.json",
                    },
                ],
            },
            clearMocks: true,
        },
        {
            displayName: "content",
            preset: "ts-jest",
            testEnvironment: "node",
            roots: ["<rootDir>/packages/content"],
            testMatch: ["**/__tests__/**/*.test.ts"],
            moduleFileExtensions: ["ts", "js"],
            transform: {
                "^.+\\.tsx?$": [
                    "ts-jest",
                    {
                        tsconfig: "<rootDir>/packages/content/tsconfig.json",
                    },
                ],
            },
            clearMocks: true,
        },
    ],
};
