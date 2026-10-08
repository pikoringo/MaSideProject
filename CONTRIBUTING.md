# Contributing to MaBestie

Thanks for helping improve MaBestie. This guide describes the repository's current lightweight workflow.

## Before you start

- Use a modern browser and Python 3 (or another static file server).
- Ask a maintainer for Supabase access if your change requires inspecting the database or its RLS policies.
- Check `git status` before editing so you do not overwrite someone else's work.

## Development workflow

1. Update your local default branch:

   ```bash
   git switch main
   git pull --ff-only
   ```

2. Create a short-lived branch:

   ```bash
   git switch -c docs/short-description
   ```

3. Start a local server:

   ```bash
   python3 -m http.server 8000
   ```

4. Make a focused change, test it in the browser, and review the diff.
5. Commit with a concise, imperative message, then push your branch and open a pull request.

## Code conventions

- Keep the app dependency-free unless a new dependency has a clear maintenance benefit.
- Prefer semantic HTML and accessible controls. New images need meaningful `alt` text, and icon-only buttons need an accessible label.
- Follow the existing CSS class naming style and keep mobile layouts in mind.
- Use `const` by default and `let` only when a binding must change.
- Keep user-visible copy and checklist definitions easy to find. Checklist items currently live in the `tasks` array in `app.js`.
- Avoid committing secrets. A Supabase publishable key may be used in a client app, but service-role keys and other privileged credentials must never be added.
- Treat database changes as API changes: update the schema documentation in `README.md` alongside the code.

## Manual test checklist

There is no automated test suite yet. Before opening a pull request, verify the behavior affected by your change and, for broad UI changes, complete this smoke test:

- The profile picker opens the home screen for both profiles and survives a refresh.
- Mono and Lilac preferences are saved independently for Julius and Rin.
- Every home card and footer destination opens the correct screen.
- The List filters correctly and supports adding, editing, and deleting items.
- Procedure details expand, prerequisites unlock in order, and progress updates.
- Archiving a completed procedure list removes Japan from navigation; restoring it brings Japan back.
- Errands support adding, editing, deleting, completing, assignments, due dates, and recurrence.
- Each profile can set its own status, and the partner's latest status appears on Home.
- All first-milestone data remains correct after a refresh.
- With the V2 Supabase migration applied, a change in one browser appears in another and the header reports **Shared & current**.
- With Supabase unavailable, cached data remains usable and the header reports a local or pending state.
- The layout remains usable at 320px and at wider desktop sizes.
- Navigation, feature, category, and action icons follow `docs/DESIGN_RULES.md`.

Also run a JavaScript syntax check when Node.js is available:

```bash
node --check app.js
```

## Pull requests

Keep pull requests small enough to review easily. In the description, include:

- What changed and why
- How you tested it
- Screenshots for visible UI changes
- Any Supabase schema or RLS changes a maintainer must apply

Do not include unrelated formatting or content changes in the same pull request.
