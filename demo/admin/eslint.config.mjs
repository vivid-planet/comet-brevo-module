// TODO: integrate custom rules from project into new eslint.config.mjs file
 // 
 // Content from .eslintrc.json:
 //
 // {
//     "extends": "@comet/eslint-config/react",
//     "ignorePatterns": ["schema.json", "src/fragmentTypes.json", "src/**/*.generated.ts"]
// }
// 
 import eslintConfigReact from "@comet/eslint-config/react.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["schema.json", "src/fragmentTypes.json", "dist/**", "src/**/*.generated.ts", "src/graphql.generated.ts"],
    },
    ...eslintConfigReact,
];

export default config;