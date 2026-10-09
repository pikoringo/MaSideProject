"""Export one transparent still per pet state from the existing 6x7 web atlases."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
DESTINATION = ROOT / "ios" / "MaBestieWidget" / "Resources"
STATES = ("idle", "hungry", "busy", "on_my_way", "sleepy", "need_a_hug", "happy")
STILL_FRAMES = (2, 3, 2, 2, 5, 5, 4)


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for pet in ("royal_lemur", "tiny_lemur"):
        source = ROOT / "images" / "pets" / f"{pet.replace('_', '-')}-atlas-v1.png"
        with Image.open(source) as atlas:
            if atlas.size != (1200, 1120):
                raise ValueError(f"Unexpected atlas dimensions: {source}: {atlas.size}")
            for row, (state, frame) in enumerate(zip(STATES, STILL_FRAMES)):
                still = atlas.crop((frame * 200, row * 160, (frame + 1) * 200, (row + 1) * 160))
                still.save(DESTINATION / f"{pet}-{state}.png", optimize=True)


if __name__ == "__main__":
    main()
