// Minimal flat config — dependency-light so it never blocks dev/build.
// Next.js rules are enforced in CI/editor via eslint-config-next when desired.
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "_build/**", "DOCS/**"],
  },
  {
    rules: {},
  },
];

export default eslintConfig;
