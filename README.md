# MaBestie

MaBestie is a personal, mobile-friendly web app built for its two users and contributors. It helps one of them get settled in Japan through an arrival checklist, practical emergency and garbage-disposal information, and shared plans.

> **Project scope:** MaBestie is currently a private two-person project, not a public-facing service or general-purpose Japan guide. It may grow into something broader in the future, but the present design and data model intentionally focus on its two users.

<img src="images/MabestieApp.png" alt="MaBestie app icon" width="160">

## Features

- Remembered Rin or Julius profile selection
- Independent Mono and Lilac profile themes
- Categorized and filterable **The List** with item details and editing
- Japan procedure checklist with prerequisite locking, progress, archiving, and restoring
- Shared errand planning with assignments, due dates, and recurrence
- Lightweight pet/avatar status updates
- Quiet Accent interface with one consistent Lucide icon system

## Tech stack

The app intentionally has no build step. It uses:

- HTML, CSS, and vanilla JavaScript
- [Lucide](https://lucide.dev/) for consistent interface icons, loaded from jsDelivr
- Browser `localStorage` for the current V2 development milestone

## Run locally

Clone the repository and serve its root directory with any static file server. For example, with Python 3:

```bash
git clone https://github.com/pikoringo/MaSideProject.git
cd MaSideProject
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly may work for basic UI development, but using a local server better matches a hosted environment. An internet connection is required to load the Lucide icon library.

## V2 data status

The first V2 milestone persists profiles, themes, statuses, list items, errands, and procedure state in browser `localStorage`. This makes the complete interface testable without changing the existing database.

Cross-device sharing between Rin and Julius is not enabled yet. The next backend milestone will define and apply a Supabase schema for:

- Profiles and theme preferences
- The List
- Errands
- Procedure progress and archives
- Current pet/avatar statuses

The app is intentionally private, but the character picker is not authentication. Database Row Level Security must be decided before cross-device sync is enabled.

## Project structure

```text
.
├── index.html       # App markup and page sections
├── style.css        # Layout and visual styles
├── app.js           # V2 state, navigation, and feature logic
├── manifest.json    # Web app metadata
├── sw.js            # Reserved for future service-worker behavior
├── images/          # Profile artwork and app icon
├── docs/            # PRD and canonical design rules
└── AGENTS.md        # Repository instructions for coding agents
```

## Data behavior

- The selected profile and all first-milestone V2 data are stored under `mabestie.v2` in `localStorage`.
- Existing profile and procedure state is migrated where possible from the V1 keys.
- Changing profiles changes identity and preferences without hiding shared local content.
- Profile selection is a convenience, not an identity or access-control boundary.

These details are important when changing the schema or tightening database access.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, conventions, and pre-commit checks.

The evolving product requirements are documented in [docs/PRD.md](docs/PRD.md). UI work must follow the canonical [Quiet Accent design rules](docs/DESIGN_RULES.md).

## Known limitations

- There is no authentication; the profile picker is a convenience, not an identity check.
- Cross-device Supabase synchronization is not implemented in the first V2 milestone.
- The service worker is empty, and the manifest is not yet wired into `index.html`, so the app should not be described as installable or offline-ready yet.
- Automated tests and linting are not configured.

## License

No license file is currently included. Unless the repository owner adds one, the code remains under the default copyright protections and should not be redistributed outside the terms set by the owner.
