// TODO: integrate custom rules from project into new eslint.config.mjs file
 // 
 // Content from .eslintrc.json:
 //
 // {
//     "extends": "@comet/eslint-config/nestjs"
// }
// 
 import eslintConfigNestJs from "@comet/eslint-config/nestjs.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["src/db/migrations/**", "dist/**", "src/**/*.generated.ts"],
    },
    ...eslintConfigNestJs,
];

export default config;