import eslintConfigNestJs from "@comet/eslint-config/nestjs.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["src/db/migrations/**", "dist/**", "src/**/*.generated.ts", "lib/**"],
        rules: {
            "@comet/no-other-module-relative-import": "off",
        },
    },
    ...eslintConfigNestJs,
];

export default config;
