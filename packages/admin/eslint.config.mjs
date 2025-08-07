// TODO: integrate custom rules from project into new eslint.config.mjs file
 // 
 // Content from .eslintrc.json:
 //
 // {
//     "extends": "@comet/eslint-config/react",
//     "ignorePatterns": ["**/*.generated.ts", "lib/**"],
//     "rules": {
//         "@comet/no-other-module-relative-import": "off"
//     }
// }
// 
 import eslintConfigReact from "@comet/eslint-config/react.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["schema.json", "src/fragmentTypes.json", "dist/**", "src/**/*.generated.ts"],
    },
    ...eslintConfigReact,
];

export default config;