# MaBestie Design Rules

**Canonical direction:** Quiet Accent

**Last updated:** October 7, 2026

All UI work must follow this document. If a new component or icon is needed, extend this system deliberately instead of introducing a one-off style.

## 1. Design intent

MaBestie is minimal, personal, and direct. Its shared structure is black, white, and neutral gray. Personal color is quiet and functional:

- Julius uses a monochrome theme.
- Rin uses a lavender accent with coral reserved for affectionate or live-status moments.

The app must not read as generally “girly.” Both profile themes use the same layout, typography, spacing, and components.

## 2. Foundations

### Typography

Use the native system sans-serif stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

- Page title: 26px, weight 500, tight line height
- Section title: 18px, weight 500
- Item title and button label: 15–16px, weight 500
- Body: 14–15px, weight 400
- Metadata: 12px, weight 400
- Do not use weights above 500.
- Do not use display or decorative typefaces.

### Spacing

Use a 4px base unit. Preferred values are 4, 8, 12, 16, 20, 24, and 32px.

- Screen side padding: 16–20px
- Section gap: 24px
- Related-item gap: 8–12px
- Card padding: 14–16px
- Minimum touch target: 44×44px

### Shape and depth

- Small controls: 8px radius
- Chips and standard cards: 12px radius
- Feature cards and dialogs: 16px radius
- Use pill shapes only for filters, statuses, and profile/theme choices.
- Use a 1px neutral border for separation.
- Shadows must be subtle and used only when a surface overlaps another surface.
- Do not use glass blur, gradients, glowing edges, or decorative background shapes.

## 3. Color tokens

Components must reference tokens rather than literal colors.

### Shared light theme

```css
--background: #fafafa;
--surface: #ffffff;
--surface-subtle: #f4f4f5;
--text: #1d1d1f;
--text-muted: #6e6b71;
--border: #e6e4e8;
--shadow: rgba(20, 20, 24, 0.08);
--danger: #b42318;
```

### Shared dark theme

```css
--background: #151416;
--surface: #201e22;
--surface-subtle: #29262b;
--text: #f5f4f7;
--text-muted: #aaa5ae;
--border: #3a373d;
--shadow: rgba(0, 0, 0, 0.24);
--danger: #ff8a80;
```

### Julius profile: Mono

```css
--accent: #1d1d1f;
--accent-foreground: #ffffff;
--accent-soft: #ededee;
```

In dark appearance, invert the accent pairing so the selected state remains visible.

```css
--accent: #f5f4f7;
--accent-foreground: #111111;
--accent-soft: #29262b;
```

### Rin profile: Lilac

```css
--accent: #7d68a7;
--accent-foreground: #ffffff;
--accent-soft: #f0ebf7;
--affection: #d96e61;
```

Use coral only for partner status, affection, or a single warm highlight. Do not use it as a second general accent.

Rin's dark appearance uses:

```css
--accent: #baa5e4;
--accent-foreground: #1c1428;
--accent-soft: #2f2939;
--affection: #f69a8e;
```

### Color behavior

- Most screens should be at least 80% neutral.
- One view should have one dominant accent.
- Never color every card or category.
- Pair color with text, icon, or shape; never communicate meaning through color alone.
- Category identity belongs primarily in labels and icons, not different card colors.

## 4. Component rules

### Navigation

- Use a flat bottom navigation bar separated by a 1px border.
- Each destination has one outline icon and a visible text label.
- Selected navigation uses the profile accent for the icon and label plus `--accent-soft` behind the item.
- Japan appears only while an active procedure list exists.
- Keep Settings persistent.

### Cards and rows

- Prefer simple list rows for dense information.
- Use cards only for grouped or highlighted content, not every element.
- Card backgrounds use `--surface`; cards do not receive category colors.
- Each row has one leading icon, one text block, and at most one trailing status or action.
- Reference screens may group important numbers in a neutral card and use linked rows for official resources. Keep the number, label, and destination visible in text.

### Filters

- Use horizontally scrollable labeled chips.
- The selected chip uses `--accent` and `--accent-foreground`.
- Unselected chips use `--surface`, `--text`, and `--border`.
- Do not use icon-only filters.

### Buttons

- One primary button per view or dialog.
- Primary buttons use the profile accent.
- Secondary buttons are neutral with a border.
- Destructive actions use `--danger` and require a visible text label.
- Icon-only buttons require an accessible label and are limited to universally understood actions such as close.

### Status and pets

- Pets and avatars may be colorful, illustrated, or animated.
- Keep status text and last-updated time visually stronger than decoration.
- Use `--affection` only for current partner status or affectionate signals in Rin's theme.
- Stale status must be communicated in text, not only by fading or color.

### Motion

- Use 150–250ms transitions for filtering, selection, dialogs, and archive changes.
- Pet idle animation may loop gently.
- No other decorative animation should loop.
- Honor `prefers-reduced-motion`.

## 5. Icon system

Use **Lucide** as the only interface icon family. Lucide's outline style matches the minimal design and provides consistent geometry.

### Implementation rules

- Keep one centrally defined icon-name mapping; do not choose icons ad hoc inside components.
- Use the same icon for the same concept everywhere.
- Default stroke width: `1.75`.
- Navigation icons: 20px.
- Feature icons: 22px.
- Inline/action icons: 18px.
- Icons inherit `currentColor`.
- Do not mix Lucide with emoji, filled icon packs, hand-drawn SVGs, or platform symbols for interface actions.
- Emoji are allowed only for pets, avatars, and user-authored content.
- Decorative icons use `aria-hidden="true"`.
- Icon-only controls require an `aria-label`.
- Pin the Lucide version when it is added to the app.

### Canonical feature mapping

| Feature or action | Lucide icon name |
| --- | --- |
| Home | `house` |
| The List | `list` |
| Japan Procedures | `landmark` |
| Errands | `shopping-basket` |
| Settings | `settings` |
| Pet status | `paw-print` |
| Survival guide | `shield-alert` |
| Emergency phone | `phone` |
| Garbage sorting | `recycle` |
| External resource | `external-link` |
| Movies | `clapperboard` |
| Places to go | `map-pin` |
| Food to eat | `utensils` |
| Wishlist | `gift` |
| Add | `plus` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Archive | `archive` |
| Restore | `archive-restore` |
| Back | `chevron-left` |
| Forward/details | `chevron-right` |
| Close | `x` |
| Complete | `check` |
| Due date | `calendar-days` |
| Recurring | `repeat-2` |
| Assigned user | `user-round` |
| Both users | `users-round` |
| Profile theme | `palette` |
| Pickup or parcel | `package` |
| Return to profile selection | `log-out` |

If a concept is not in this table, add it here before using a new icon.

## 6. Accessibility

- Meet WCAG AA contrast for text and essential controls.
- Never remove visible focus indicators.
- Keep interactive targets at least 44×44px on touch devices.
- Provide visible labels for primary navigation and unfamiliar actions.
- Do not place essential information behind hover.
- Use semantic buttons, headings, form labels, and dialogs.
- Ensure both profile themes remain readable in light and dark appearances.

## 7. Review checklist

Before merging a UI change, confirm:

- It uses shared tokens and existing spacing values.
- It works in both Mono and Lilac profile themes.
- It uses only canonical Lucide icons for interface chrome.
- No emoji is being used as a navigation, feature, or action icon.
- Color is restrained and has a non-color cue.
- The layout works at 320px width.
- Touch targets and focus states remain usable.
- Any new pattern or icon is documented here.
