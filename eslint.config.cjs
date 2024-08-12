const babel = require("@babel/eslint-plugin");
const globals = require("globals");
const babelParser = require("@babel/eslint-parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    ignores: ["**/index.cjs"],
}, ...compat.extends("eslint:recommended"), {
    plugins: {
        "@babel": babel,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
            ...globals.commonjs,
            ...globals.mocha,
        },

        parser: babelParser,
        ecmaVersion: 2018,
        sourceType: "module",

        parserOptions: {
            babelOptions: {
                configFile: "./.babelrc",
            },
        },
    },

    rules: {},
}];