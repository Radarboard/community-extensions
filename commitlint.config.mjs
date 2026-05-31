export default {
  extends: ["@commitlint/config-conventional"],
  ignores: [(message) => message.startsWith("Version Packages")],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "catalog",
        "ci",
        "deps",
        "docs",
        "examples",
        "fixtures",
        "integrations",
        "plugins",
        "repo",
        "scripts",
        "skills",
        "templates",
        "tools",
        "widgets",
      ],
    ],
    "scope-empty": [2, "never"],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],
  },
};
