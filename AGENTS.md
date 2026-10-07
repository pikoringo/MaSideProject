# Repository Instructions for Coding Agents

## Product context

MaBestie is a private two-person app. Read [docs/PRD.md](docs/PRD.md) before changing product behavior.

## UI requirements

Before creating or modifying UI, read and follow [docs/DESIGN_RULES.md](docs/DESIGN_RULES.md). Its **Quiet Accent** system is authoritative.

- Preserve the shared minimal structure across both user themes.
- Use design tokens; do not introduce one-off colors, spacing, radii, shadows, or typography.
- Use Lucide as the only interface icon family and follow the canonical icon mapping.
- Do not use emoji for navigation, feature, category, or action icons. Emoji are reserved for pets, avatars, and user-authored content.
- If a required pattern or icon is missing, update `docs/DESIGN_RULES.md` before using it.
- Test UI changes at 320px width and in both Mono and Lilac profile themes.

## Project constraints

- Keep the app dependency-free unless a dependency has a clear maintenance benefit.
- Do not add a build step solely for styling or icons.
- Preserve existing user data behavior unless the PRD explicitly changes it.
- Keep changes focused and update relevant documentation with behavior changes.
