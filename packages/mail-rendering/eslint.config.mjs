import eslintConfigNextJs from "@comet/eslint-config/nextjs.js";

/** @type {import('eslint')} */
const config = [
    {
        ignores: ["**/**/*.generated.ts", "dist/**", "lang/**", "lang-compiled/**", "lang-extracted/**", ".next/**", "public/**", "lib/**"],
    },
    ...eslintConfigNextJs,
    {
        rules: {
            "@comet/no-other-module-relative-import": "off",
            "react/react-in-jsx-scope": "off",
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "react",
                            importNames: ["default"],
                        },
                    ],
                },
            ],
        },
    },
];

export default config;
