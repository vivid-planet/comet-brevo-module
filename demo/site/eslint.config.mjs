// TODO: integrate custom rules from project into new eslint.config.mjs file
 // 
 // Content from .eslintrc.json:
 //
 // {
//     "extends": "@comet/eslint-config/nextjs",
//     "ignorePatterns": ["**/**/*.generated.ts"]
// }
// 
 import eslintConfigNextJs from "@comet/eslint-config/nextjs.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["**/**/*.generated.ts", "dist/**", "lang/**", "lang-compiled/**", "lang-extracted/**", ".next/**", "public/**"],
    },
    ...eslintConfigNextJs,
];

export default config;