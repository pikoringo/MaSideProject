#!/usr/bin/env python3
"""Normalize an irregular transparent concept sheet into an even sprite atlas."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def find_row_cutoffs(alpha: Image.Image, rows: int) -> list[int]:
    """Find the optimal horizontal split lines between concept art rows."""
    width, height = alpha.size
    pixels = alpha.load()
    row_sums = [sum(1 for x in range(width) if pixels[x, y] > 40) for y in range(height)]
    cutoffs = [0]
    nominal_h = height / rows

    for r in range(1, rows):
        nominal_y = round(r * nominal_h)
        window = range(max(0, nominal_y - 45), min(height, nominal_y + 45))
        best_y = min(window, key=lambda y: row_sums[y])
        cutoffs.append(best_y)

    cutoffs.append(height)
    return cutoffs


def connected_components(
    alpha: Image.Image,
    y_start: int,
    y_end: int,
    threshold: int,
) -> list[dict]:
    width, _ = alpha.size
    pixels = alpha.load()
    seen: set[tuple[int, int]] = set()
    components: list[dict] = []

    for y in range(y_start, y_end):
        for x in range(width):
            if (x, y) in seen or pixels[x, y] < threshold:
                continue

            queue = deque([(x, y)])
            seen.add((x, y))
            area = 0
            x_total = 0
            min_x, max_x = x, x
            min_y, max_y = y, y

            while queue:
                current_x, current_y = queue.popleft()
                area += 1
                x_total += current_x
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    point = (next_x, next_y)
                    if (
                        0 <= next_x < width
                        and y_start <= next_y < y_end
                        and point not in seen
                        and pixels[next_x, next_y] >= threshold
                    ):
                        seen.add(point)
                        queue.append(point)

            if area >= 500:
                components.append({
                    "area": area,
                    "center_x": round(x_total / area),
                    "bbox": (min_x, min_y, max_x + 1, max_y + 1),
                })

    return components


def extract_row_frames(
    source: Image.Image,
    y_start: int,
    y_end: int,
    columns: int,
    threshold: int,
) -> list[Image.Image]:
    alpha = source.getchannel("A")
    components = connected_components(alpha, y_start, y_end, threshold)
    primary = sorted(
        sorted(components, key=lambda item: item["area"], reverse=True)[:columns],
        key=lambda item: item["center_x"],
    )
    if len(primary) != columns:
        raise ValueError(
            f"Segment [{y_start}, {y_end}] contains {len(primary)} primary sprites; expected {columns}."
        )

    frames: list[Image.Image] = []
    for comp in primary:
        frame = source.crop(comp["bbox"])
        frames.append(frame)
    return frames


def normalize(
    source_path: Path,
    output_path: Path,
    columns: int,
    rows: int,
    cell_width: int,
    cell_height: int,
    padding: int,
    threshold: int,
) -> None:
    source = Image.open(source_path).convert("RGBA")
    cutoffs = find_row_cutoffs(source.getchannel("A"), rows)
    atlas = Image.new("RGBA", (columns * cell_width, rows * cell_height), (0, 0, 0, 0))

    for row in range(rows):
        y_start, y_end = cutoffs[row], cutoffs[row + 1]
        frames = extract_row_frames(source, y_start, y_end, columns, threshold)
        max_width = max(frame.width for frame in frames)
        max_height = max(frame.height for frame in frames)
        scale = min(
            (cell_width - 2 * padding) / max_width,
            (cell_height - 2 * padding) / max_height,
        )

        for column, frame in enumerate(frames):
            resized = frame.resize(
                (max(1, round(frame.width * scale)), max(1, round(frame.height * scale))),
                Image.Resampling.LANCZOS,
            )
            x = column * cell_width + (cell_width - resized.width) // 2
            y = row * cell_height + cell_height - padding - resized.height
            atlas.alpha_composite(resized, (x, y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output_path, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--columns", type=int, default=6)
    parser.add_argument("--rows", type=int, default=7)
    parser.add_argument("--cell-width", type=int, default=200)
    parser.add_argument("--cell-height", type=int, default=160)
    parser.add_argument("--padding", type=int, default=8)
    parser.add_argument("--alpha-threshold", type=int, default=64)
    args = parser.parse_args()

    normalize(
        args.source,
        args.output,
        args.columns,
        args.rows,
        args.cell_width,
        args.cell_height,
        args.padding,
        args.alpha_threshold,
    )


if __name__ == "__main__":
    main()
