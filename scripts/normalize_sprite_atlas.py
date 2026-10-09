#!/usr/bin/env python3
"""Normalize an irregular transparent concept sheet into an even sprite atlas."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def connected_components(alpha: Image.Image, y_start: int, y_end: int, threshold: int) -> list[tuple[int, int, int]]:
    width, _ = alpha.size
    pixels = alpha.load()
    seen: set[tuple[int, int]] = set()
    components: list[tuple[int, int, int]] = []

    for y in range(y_start, y_end):
        for x in range(width):
            if (x, y) in seen or pixels[x, y] < threshold:
                continue

            queue = deque([(x, y)])
            seen.add((x, y))
            area = 0
            x_total = 0

            while queue:
                current_x, current_y = queue.popleft()
                area += 1
                x_total += current_x
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

            if area >= 1000:
                components.append((area, round(x_total / area), x_total))

    return components


def extract_row_frames(
    source: Image.Image,
    row: int,
    rows: int,
    columns: int,
    threshold: int,
) -> list[Image.Image]:
    width, height = source.size
    y_start = round(row * height / rows)
    y_end = round((row + 1) * height / rows)
    components = connected_components(source.getchannel("A"), y_start, y_end, threshold)
    primary = sorted(sorted(components, reverse=True)[:columns], key=lambda item: item[1])
    if len(primary) != columns:
        raise ValueError(f"Row {row} contains {len(primary)} primary sprites; expected {columns}.")

    centers = [component[1] for component in primary]
    separators = [0]
    separators.extend(round((left + right) / 2) for left, right in zip(centers, centers[1:]))
    separators.append(width)

    frames: list[Image.Image] = []
    for column in range(columns):
        segment = source.crop((separators[column], y_start, separators[column + 1], y_end))
        bounds = segment.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"Row {row}, column {column} is empty.")
        frames.append(segment.crop(bounds))
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
    atlas = Image.new("RGBA", (columns * cell_width, rows * cell_height), (0, 0, 0, 0))

    for row in range(rows):
        frames = extract_row_frames(source, row, rows, columns, threshold)
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
