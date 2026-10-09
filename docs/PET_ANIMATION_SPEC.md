# Pet animation specification

**Status:** Web animation live; native widget source prototype in progress

MaBestie uses two original pixel pets with a shared animation vocabulary:

- **Royal lemur:** theatrical, energetic, crown and tail-led motion
- **Tiny lemur:** affectionate, compact, eye and hop-led motion

The pet is selected per profile. Pet selection and pet state are synchronized so the partner sees the same character and state in the app and, later, in the iPhone widget.

## Core states

| State | Meaning | Royal lemur loop | Tiny lemur loop |
| --- | --- | --- | --- |
| `idle` | Available or no special need | Breathe, blink, tail sway | Breathe, blink, tail twitch |
| `hungry` | Wants food | Rub belly, look for food | Pat belly, hopeful glance |
| `busy` | Working or studying | Read a small book | Hold and read a small book |
| `on_my_way` | Traveling or coming home | Confident side-step walk | Quick hopping walk |
| `sleepy` | Resting or ready for bed | Yawn, curl beside tail | Yawn, curl into tail |
| `need_a_hug` | Wants attention or comfort | Droop, then reach forward | Sad posture, then open arms |
| `happy` | Excited or celebrating | Dramatic dance and crown bounce | Excited hops and tiny dance |

`idle` is the default. Status copy remains visible next to the pet so meaning never depends on animation alone.

## Sprite sources

- [`royal-lemur-sprites-v3.png`](../images/pets/royal-lemur-sprites-v3.png) — current production prototype with the approved masculine, confident facial direction
- [`tiny-lemur-sprites-v2.png`](../images/pets/tiny-lemur-sprites-v2.png) — current production prototype with the approved feminine, wide-eyed facial direction
- [`royal-lemur-sprites-v2.png`](../images/pets/royal-lemur-sprites-v2.png) — retained earlier direction
- [`royal-lemur-sprites-v1.png`](../images/pets/royal-lemur-sprites-v1.png) — retained as the softer initial exploration
- [`tiny-lemur-sprites-v1.png`](../images/pets/tiny-lemur-sprites-v1.png)

Each current sheet contains seven rows in the state order above and six frames per row. The web prototype treats every sheet as a deterministic 6-by-7 atlas and clips it through a fixed-aspect viewport. A later art-polish pass may still tighten individual ground anchors before the native widget export.

Production web atlases are generated from those concept sheets with [`scripts/normalize_sprite_atlas.py`](../scripts/normalize_sprite_atlas.py). The normalizer isolates each pose, applies a stable scale within each animation row, centers it horizontally, and aligns it to a shared ground line. The app currently loads:

- [`royal-lemur-atlas-v1.png`](../images/pets/royal-lemur-atlas-v1.png)
- [`tiny-lemur-atlas-v1.png`](../images/pets/tiny-lemur-atlas-v1.png)

Existing status labels map to pet states as follows:

| Status label | Pet state |
| --- | --- |
| No status | `idle` |
| At work | `busy` |
| Studying | `busy` |
| On my way | `on_my_way` |
| Resting | `sleepy` |
| Need a hug | `need_a_hug` |

## Playback rules

### Web app

- Use 6–10 frames per second depending on the motion.
- Loop `idle`, `hungry`, `busy`, `on_my_way`, and `happy` while the pet is visible.
- Play the transition into `sleepy` or `need_a_hug`, then hold or use a slower loop.
- Pause animation when the page is hidden.
- Under `prefers-reduced-motion`, show the most expressive static frame.

### iPhone widget

WidgetKit does not run a continuous game loop. Show a short animation of no more than two seconds when widget data changes, then hold a representative static frame. Use timeline or push-driven refreshes when the partner changes the pet state; do not schedule frame-by-frame timeline entries.

The current [native prototype](../ios/README.md) uses one still frame per state and offers separate Rin-status and Julius-status widgets. It fetches the latest partner profile from Supabase on WidgetKit's timeline; this is not realtime. A distributable widget and change-transition animation remain future work.

## Data shape

Each profile needs:

- `pet_id`: `royal_lemur` or `tiny_lemur`
- `pet_state`: one of the seven state keys
- `pet_message`: optional short text
- `pet_updated_at`: timestamp used for freshness and widget updates

Pet selection belongs in Settings. Pet state belongs in the Home status editor so changing a state remains a quick action.
