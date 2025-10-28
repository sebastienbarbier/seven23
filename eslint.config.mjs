import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js", "**/*.jsx"],
        plugins: {
            react,
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Generator: true,
                test: "readonly",
            },

            ecmaVersion: 12,
            sourceType: "module",

            parserOptions: {
                parser: "@babel/eslint-parser",
                requireConfigFile: false,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        rules: {
            "react/jsx-uses-react": 2,
            "react/jsx-uses-vars": 2,
            "react/react-in-jsx-scope": 0,
            "react/prop-types": 0,
            curly: [2],
            quotes: [1, "double"],
            "linebreak-style": [2, "unix"],
            semi: [2, "always"],
            "comma-dangle": [0],

            "no-unused-vars": [2, {
                vars: "all",
                args: "none",
            }],

            "no-console": [0],
        },
    },
    {
        files: ["**/*.test.js", "**/*.spec.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                test: "readonly",
                expect: "readonly",
                describe: "readonly",
                it: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
            },
        },
        rules: {
            "no-unused-vars": [2, {
                vars: "all",
                args: "none",
                varsIgnorePattern: "^_",
            }],
        },
    }
];