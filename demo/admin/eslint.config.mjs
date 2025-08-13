import eslintConfigReact from "@comet/eslint-config/react.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["schema.json", "src/fragmentTypes.json", "dist/**", "src/**/*.generated.ts", "src/graphql.generated.ts"],
    },
    ...eslintConfigReact,
];

export default config;
