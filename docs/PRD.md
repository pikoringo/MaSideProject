# MaBestie Product Requirements Document

**Status:** Working draft

**Audience:** The two MaBestie users and contributors

**Last updated:** October 9, 2026

## 1. Product summary

MaBestie is a private, two-person companion app. It helps its users coordinate life in Japan, collect things they want to experience together, share errands, and communicate lightweight personal status through their avatars or pets.

The product is intentionally designed for two known users. Public accounts, discovery, social feeds, and general-purpose use are outside the current scope.

## 2. Product principles

- **Personal before scalable:** Optimize for the two intended users rather than generalized workflows.
- **Warm, not transactional:** Shared tasks and plans should feel affectionate and encouraging.
- **Glanceable:** Important status, ownership, progress, and due dates should be understandable quickly.
- **Low effort:** Common actions should require only a few taps.
- **Recoverable:** Archived content remains available and can be restored.

## 3. Primary navigation

### Sign-in, profile selection, and app entry

On a new device, the app first asks the user to sign in through a passwordless email link. Only the two approved Supabase Auth users can reach shared data. After sign-in, the app asks **Which character are you?** The user chooses either **Rin** or **Julius**, then enters the full app.

The selected profile determines:

- The user's name, pet, and avatar
- The user's saved Mono or Lilac theme
- Which user owns a newly posted status
- The default assignee or creator on new shared content
- How the partner's status is labeled and presented

The profile selection is remembered on that device. A user can change profiles later from **Settings → Profile**. Switching profiles changes the active identity and preferences but does not delete or hide shared content.

Authentication protects the private shared space. The character picker remains a separate convenience: either approved person can select either character, and the active character can be changed later from **Settings → Profile**. Signing out is also available in Settings.

### Footer navigation

The active footer contains:

1. Home
2. The List
3. Japan Procedures, while an active procedure list exists
4. Errands
5. Settings

When the Japan Procedures list is archived, its footer item disappears. Archived procedure lists are accessible from **Settings → Archived lists**, where they can be reviewed or restored. Restoring a procedure list returns the Japan item to the footer.

## 4. Feature requirements

### 4.1 The List

Rename **Our Ideas** and **Date Ideas** to **The List** throughout the app.

The List is a shared collection with these initial categories:

- Movies
- Places to go
- Food to eat
- Wishlist items to buy

Requirements:

- Show all items by default.
- Allow filtering by one category at a time.
- Show the number of visible items after filtering.
- Open an item detail view when an item is selected.
- Allow both users to add, edit, and delete an item.
- Store a title, category, description, creator, and creation date for each item.
- Preserve room for later optional fields such as links, estimated cost, location, and completion state.

### 4.2 Japan Procedures

Requirements:

- Continue showing checklist progress and prerequisite locking.
- Enable **Archive list** only after every procedure in the list is complete.
- Ask for confirmation before archiving.
- Store the archive date and the completed checklist state.
- Remove Japan Procedures from the footer after archiving.
- Show archived lists under **Settings → Archived lists**.
- Allow an archived list to be viewed and restored.
- Restoring the list returns its footer item and previous completion state.

### 4.3 Errands

Errands are shared, actionable tasks rather than aspirational ideas. Initial categories:

- Groceries and household restocking
- Pickups, deliveries, and returns
- Household chores and garbage days
- Appointments, bills, and administrative tasks

Each errand should support:

- Title and optional notes
- Category
- Assignee: User A, User B, both, or unassigned
- Due date or no due date
- Optional recurring schedule
- Open or completed state
- Creator and completion metadata

The default view shows open errands first, with compact summaries for open, due-today, and recurring items. Completed errands can be hidden from the default view without being deleted.

### 4.4 Pet status and iOS widget

Each user has a distinct pet or avatar. A user sets only their own status; their partner sees that status in the app and, later, in an iOS home-screen widget.

Initial status choices:

- At work
- Studying
- On my way
- Resting
- Need a hug

Requirements:

- Show the user's pet, status label, optional short message, and last-updated time.
- Display the partner's latest status on Home.
- Clearly identify stale status with its timestamp.
- Keep the widget read-only in the first release; status editing happens in the app.
- Store only the latest active status per user initially.

The current web app can implement the in-app status experience. A real iOS home-screen widget requires a later native iOS/WidgetKit component and a deliberate refresh strategy.

### 4.5 Settings and per-user themes

Settings is a persistent footer destination.

Requirements:

- Allow each user to choose and save their own theme independently.
- Applying a theme changes the current user's app appearance without changing their partner's preference.
- Sync a user's preference so it follows them across supported devices.
- Include an archived-lists section.
- Include profile and pet/avatar settings later without requiring a navigation redesign.

Initial profile themes:

- **Mono:** black, white, and graphite for Julius
- **Lilac:** a neutral base with a quiet lavender accent for Rin

Coral is reserved for affectionate or status-related highlights in Rin's theme. It is not a general-purpose surface color.

## 5. Design direction

### Quiet Accent

MaBestie uses a minimal black-and-white foundation with restrained personal color. The interface should feel direct, calm, and functional rather than decorative or overtly feminine.

Core rules:

- Use flat, opaque surfaces. Do not use frosted glass, gradients, background blobs, or decorative textures.
- Use the system sans-serif font stack for all interface text.
- Keep layouts mobile-first, compact, and easy to scan.
- Use thin neutral borders, subtle shadows, and medium corner radii.
- Use color only for selection, status, progress, ownership, or a small personal moment.
- Keep the same component structure across both profiles; only theme tokens change.
- Give Julius a monochrome profile theme and Rin a lavender-led profile theme with sparing coral highlights.
- Use one consistent outline icon family for navigation, features, and actions.
- Reserve emoji and illustrated artwork for pets, avatars, and user-created content—not interface chrome.

The canonical tokens, component rules, and icon mapping live in [DESIGN_RULES.md](DESIGN_RULES.md). That document is authoritative for implementation.

## 6. Shared data model

Supabase is the shared source of truth across both users' devices. Browser `localStorage` is an immediate device cache and fallback, not the authoritative database once cloud setup is complete.

V2 uses these tables:

- `profiles`: the two fixed profile names, theme preference, and latest status fields
- `list_items`: categorized items for The List, including creator and timestamps
- `procedure_lists`: active or archived Japan list metadata and archive date
- `procedure_progress`: completion state and completing profile for each task
- `errands`: category, assignment, scheduling, notes, completion metadata, and timestamps

The web app renders the local cache first, downloads shared state, and subscribes to Realtime database changes. If the cloud is empty, the first connected device initializes shared collections from its cache. An archive is a reversible state update; it does not delete the procedure list or progress.

### Access control

Supabase Auth provides passwordless email sessions. Public signup is disabled, and only the two invited users are enrolled in `app_members`. Row Level Security denies the unauthenticated role and requires both an authenticated session and membership for every shared table operation.

Authentication identity and character identity intentionally remain separate. A signed-in member can change between Rin and Julius in Settings without changing the account or ending the session.

## 7. Non-goals for the next release

- Public registration or third-party accounts
- Social sharing or public profiles
- Comments, reactions, or activity feeds
- Advanced trip planning, booking, or payments
- Real-time location sharing
- A native iOS widget in the same release as the web UI changes

## 8. Acceptance criteria for the prototype direction

- Home labels the shared collection **The List**.
- The List can be filtered by all four categories.
- List items open into an editable detail view.
- Archiving a completed Japan list removes Japan from the footer.
- Settings exposes the archived list and can restore it.
- Settings demonstrates distinct saved theme choices for each user.
- The visual system follows Quiet Accent: a neutral base, flat surfaces, system typography, restrained per-user accents, and one consistent outline icon family.
