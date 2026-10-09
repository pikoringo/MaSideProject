# Pet animation specification

**Status:** Concept sprites, version 1

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

- [`royal-lemur-sprites-v1.png`](../images/pets/royal-lemur-sprites-v1.png)
- [`tiny-lemur-sprites-v1.png`](../images/pets/tiny-lemur-sprites-v1.png)

Each concept sheet contains seven rows in the state order above and six frames per row. Before production use, normalize the generated cells into a deterministic sprite atlas with equal frame dimensions and a shared ground anchor.

## Playback rules

### Web app

- Use 6–10 frames per second depending on the motion.
- Loop `idle`, `hungry`, `busy`, `on_my_way`, and `happy` while the pet is visible.
- Play the transition into `sleepy` or `need_a_hug`, then hold or use a slower loop.
- Pause animation when the page is hidden.
- Under `prefers-reduced-motion`, show the most expressive static frame.

### iPhone widget

WidgetKit does not run a continuous game loop. Show a short animation of no more than two seconds when widget data changes, then hold a representative static frame. Use timeline or push-driven refreshes when the partner changes the pet state; do not schedule frame-by-frame timeline entries.

## Data shape

Each profile needs:

- `pet_id`: `royal_lemur` or `tiny_lemur`
- `pet_state`: one of the seven state keys
- `pet_message`: optional short text
- `pet_updated_at`: timestamp used for freshness and widget updates

Pet selection belongs in Settings. Pet state belongs in the Home status editor so changing a state remains a quick action.
