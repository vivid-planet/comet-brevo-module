import cometConfig from "@comet/eslint-config/react.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["**/**/*.generated.ts", "dist/**", "lang/**", "lang-compiled/**", "lang-extracted/**", ".next/**", "public/**"],
    },
    ...cometConfig,
];

export default config;
