import jsxA11y from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    settings: {
      "jsx-a11y": {
        components: {
          IconButton: "button",
          Button: "button",
          SubmitButton: "button",
          FormButton: "button",
          Input: "input",
          TextField: "input",
          Select: "select",
          Link: "a",
        },
      },
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "jsx-a11y/control-has-associated-label": [
        "error",
        {
          labelAttributes: ["label"],
          controlComponents: ["IconButton", "Button", "FormButton", "SubmitButton"],
          ignoreElements: ["audio", "canvas", "embed", "input", "textarea", "tr", "video"],
          ignoreRoles: ["grid", "listbox", "menu", "menubar", "radiogroup", "row", "tablist", "toolbar", "tree", "treegrid"],
        },
      ],
      "jsx-a11y/label-has-associated-control": [
        "error",
        {
          labelComponents: ["label", "InputLabel"],
          labelAttributes: ["label"],
          controlComponents: ["Input", "Select", "TextField", "CheckboxGroup", "RadioGroup"],
          depth: 3,
        },
      ],
      "jsx-a11y/anchor-has-content": [
        "error",
        {
          components: ["Link"],
        },
      ],
    },
  },
];
