# Codex Project Instructions

## Git Stewardship

Codex is responsible for managing Git hygiene for this project.

- After each stable block of work, create a local commit with a clear message.
- Push committed work to `origin main` regularly once the work has been checked.
- Run the relevant verification before important commits. For app changes, prefer `npm run build`.
- Do not ask the user to manage routine Git steps unless authentication or an external GitHub action is required.
- Keep `origin` on SSH (`git@github.com:AlexiaPeri/emotionalappv1.git`) unless the user explicitly requests otherwise.
- Never commit secrets, tokens, credentials, or personal/private notes.
- Leave `notes/` untracked unless the user explicitly asks to include it.
- If a push fails, diagnose it and explain the exact missing external step.

## Collaboration

- The user is not expected to manage technical Git details.
- Keep the user informed when making checkpoints, especially before pushing.
- Preserve unrelated user changes. Do not reset or revert without explicit instruction.
