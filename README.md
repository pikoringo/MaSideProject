# MaBestie

MaBestie is a personal, mobile-friendly web app built for its two users and contributors. It helps one of them get settled in Japan through an arrival checklist, practical emergency and garbage-disposal information, and shared plans.

> **Project scope:** MaBestie is currently a private two-person project, not a public-facing service or general-purpose Japan guide. It may grow into something broader in the future, but the present design and data model intentionally focus on its two users.

<img src="images/MabestieApp.png" alt="MaBestie app icon" width="160">

## Features

- Remembered Rin or Julius profile selection
- Passwordless access restricted to two approved Supabase users
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
- [Supabase](https://supabase.com/) for shared Postgres data and Realtime updates
- Browser `localStorage` as the immediate offline cache

## Run locally

Clone the repository and serve its root directory with any static file server. For example, with Python 3:

```bash
git clone https://github.com/pikoringo/MaSideProject.git
cd MaSideProject
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly may work for basic UI development, but using a local server better matches a hosted environment. An internet connection is required to load the Lucide icon library.

## V2 shared data

V2 connects both users to one Supabase database. Profiles, themes, statuses, list items, errands, and procedure state are shared, while `localStorage` keeps a device cache so the interface can still open when the network is unavailable.

Database setup and authentication enrollment are documented in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

When connected:

- One user's changes are stored in Supabase and appear on the other user's open app through Realtime.
- Empty cloud collections are initialized once from the first device's local cache.
- Archiving changes the shared Japan list state; it does not delete its checklist progress.
- A failed write remains in the local cache and is labeled **Changes pending**.

Supabase Auth protects database access. The Rin/Julius character picker remains separate from authentication and can be changed from Settings.

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
├── supabase/         # Reproducible database migrations
└── AGENTS.md        # Repository instructions for coding agents
```

## Data behavior

- The selected profile and cached V2 data are stored under `mabestie.v2` in `localStorage`.
- Shared product data is stored in Supabase after the V2 migration is applied.
- Existing profile and procedure state is migrated where possible from the V1 keys.
- Changing profiles changes identity and preferences without hiding shared local content.
- Authentication controls access; character selection controls in-app identity and can be changed independently.

These details are important when changing the schema or tightening database access.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, conventions, and pre-commit checks.

The evolving product requirements are documented in [docs/PRD.md](docs/PRD.md). UI work must follow the canonical [Quiet Accent design rules](docs/DESIGN_RULES.md).

## Known limitations

- The service worker is empty, so cached data does not make every app asset available offline.
- Failed cloud writes stay in the local cache but are not automatically replayed after reconnecting yet.
- Automated tests and linting are not configured.

## License

No license file is currently included. Unless the repository owner adds one, the code remains under the default copyright protections and should not be redistributed outside the terms set by the owner.
