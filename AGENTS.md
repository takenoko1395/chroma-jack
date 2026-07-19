# chroma-jack — Codex instructions

## Project overview

`chroma-jack` is a game prototype in which players judge colors visually and try to
move the current color toward white. Players draw color cards and choose whether to
add or discard them; exceeding the limit of any RGB component causes a burst.

The prototype should validate whether color-only decisions are enjoyable, whether
approaching white feels rewarding, whether bursting creates tension, and whether
the game remains understandable without numeric values.

## Sources of truth

- Read `README.md` and relevant files under `docs/` before changing behavior.
- Treat the repository as an early prototype. Do not assume a framework, language,
  deployment target, or architecture until it is established by the codebase or the
  user.
- Preserve the color-first, intuition-driven experience. Avoid exposing RGB values
  or other numeric hints unless the user explicitly requests them.

## Working rules

- Learn implementation details from the repository before asking the user.
- Frame non-trivial work with its purpose, non-goals, done criteria, and likely
  impact area.
- Keep changes small and preserve existing behavior outside the requested scope.
- Name functions with verbs and types/components with nouns. Avoid vague names such
  as `data`, `info`, and `file` when a domain-specific name is available.
- Validate values that could cause an error before using them. Keep secrets and
  environment-specific endpoints out of source code.
- Follow the architecture and conventions already established by the project. When
  introducing a new convention, document the reason and avoid premature abstraction.
- Separate state transitions and side effects from rendering when the selected UI
  framework supports that separation.
- Split UI components by reason to change, not merely by appearance. Prefer
  component extraction when a unit has multiple responsibilities or independent
  interaction behavior.

## Verification and review

- Run the narrowest relevant checks after edits. If no automated checks exist,
  inspect the changed behavior and state what could not be verified.
- After non-trivial code changes, use the `quality_reviewer` agent.
- For UI, copy, loading, empty, error, retry, or user-flow changes, also use the
  `user_reviewer` agent.
- For authentication, authorization, APIs, external input, secrets, identity,
  permissions, infrastructure, or logging-sensitive changes, also use the
  `security_reviewer` agent.
- Select only the review viewpoints justified by the change. Run independent
  viewpoints in parallel when practical, then deduplicate overlapping findings.
- Report concrete regressions and user impact before stylistic observations.

## Safety

- Do not deploy, publish, apply infrastructure changes, or perform destructive
  operations without explicit user authorization.
- Gather related approval needs into one request when practical.

