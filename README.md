# MaBestie

MaBestie is a personal, mobile-friendly web app built for its two users and contributors. It helps one of them get settled in Japan through an arrival checklist, practical emergency and garbage-disposal information, and shared plans.

> **Project scope:** MaBestie is currently a private two-person project, not a public-facing service or general-purpose Japan guide. It may grow into something broader in the future, but the present design and data model intentionally focus on its two users.

<img src="images/MabestieApp.png" alt="MaBestie app icon" width="160">

## Features

- Two-person profile selection, remembered in the browser
- Arrival and daily-setup checklists with prerequisite locking
- Progress indicators for each checklist section
- Expandable task notes and useful Japanese phrases
- Emergency contacts and links to Maebashi's garbage guidance
- Shared date ideas backed by Supabase
- Local progress caching with `localStorage`

## Tech stack

The app intentionally has no build step or package dependencies. It uses:

- HTML, CSS, and vanilla JavaScript
- [Supabase JavaScript client v2](https://supabase.com/docs/reference/javascript/introduction), loaded from jsDelivr
- Supabase tables for shared checklist progress and date ideas
- Browser `localStorage` for the selected profile and a local copy of checklist state

## Run locally

Clone the repository and serve its root directory with any static file server. For example, with Python 3:

```bash
git clone https://github.com/pikoringo/MaSideProject.git
cd MaSideProject
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly may work for basic UI development, but using a local server better matches a hosted environment. An internet connection is required to load the Supabase client and use shared data.

## Supabase setup

The current Supabase project URL and publishable key are defined at the top of `app.js`. Supabase publishable keys are designed for use in browser clients; data must still be protected with appropriate Row Level Security (RLS) policies.

The frontend expects these tables:

### `task_progress`

| Column | Expected type | Notes |
| --- | --- | --- |
| `task_id` | text | Unique key used by the checklist upsert |
| `completed` | boolean | Completion state |
| `user_name` | text | Profile that last changed the task |
| `updated_at` | timestamp with time zone | Client-generated update time |

The upsert in `app.js` uses `task_id` as its conflict target, so that column needs a unique or primary-key constraint.

### `date_ideas`

| Column | Expected type | Notes |
| --- | --- | --- |
| `id` | integer or bigint | Generated primary key |
| `idea` | text | Date idea shown in the app |
| `created_by` | text | Selected profile |
| `created_at` | timestamp with time zone | Used to sort ideas; a database default is recommended |

The browser client currently needs permission to select, insert, and update checklist progress and to select, insert, and delete date ideas. Review those permissions and the corresponding RLS policies before using the app with sensitive or public data.

## Project structure

```text
.
├── index.html       # App markup and page sections
├── style.css        # Layout and visual styles
├── app.js           # Navigation, checklist logic, and Supabase calls
├── manifest.json    # Web app metadata
├── sw.js            # Reserved for future service-worker behavior
└── images/          # Profile artwork and app icon
```

## Data behavior

- The selected profile is stored as `currentUser` in `localStorage`.
- Each checklist item is also cached locally under its task ID.
- On load, remote rows from `task_progress` are applied over the local checklist state.
- Checklist rows are shared by `task_id`; they are not currently separated per profile.
- Date ideas are shared, and the current UI allows any app user with database access to delete any idea.

These details are important when changing the schema or tightening database access.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, conventions, and pre-commit checks.

The evolving product requirements are documented in [docs/PRD.md](docs/PRD.md). UI work must follow the canonical [Quiet Accent design rules](docs/DESIGN_RULES.md).

## Known limitations

- There is no authentication; the profile picker is a convenience, not an identity check.
- Supabase errors are written to the browser console rather than shown in the UI.
- The service worker is empty, and the manifest is not yet wired into `index.html`, so the app should not be described as installable or offline-ready yet.
- Automated tests and linting are not configured.

## License

No license file is currently included. Unless the repository owner adds one, the code remains under the default copyright protections and should not be redistributed outside the terms set by the owner.
