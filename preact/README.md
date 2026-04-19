# solid-apps / preact

Experiment area inside [solid-apps](../). Starts with the simplest possible Preact render of a `urn:solid:` JSON-LD data island, then progressively pushes the limits until it either matches React-quality SPA output or we find where it breaks.

Lives here (not its own repo) because gh-pages and the data conventions are already set up — and because experimenting with apps is what this repo is for.

Each stage is a single self-contained HTML file (zero build). A stage graduates to real tooling only when CDN-ESM stops being enough — if it ever does.

## Stages

| Stage | Focus |
|-------|-------|
| 01-hello | Minimal Preact render: mount a `<Profile>` component, read JSON-LD from a `<script type="application/ld+json">` island, display it. Inspired by the Pivot profile layout at sharon.pivot-test.solidproject.org. Static; no state, no edits. |
| 02-inline-edit | `useState` / signals; click a field to edit; debounced PUT on blur. |
| 03-routing | Hash routes, multi-page SPA shell. |
| 04-fetch | Load external WebIDs. |
| 05+ | TBD — whatever the previous stages surface as the next limit. |

## Findings

_(populated as we discover them)_

## Running

Live: <https://solid-apps.github.io/preact/01-hello/>

```bash
# Or locally — nothing to install:
python3 -m http.server 8000
# → http://localhost:8000/preact/01-hello/
```

## License

AGPL-3.0 for code, CC BY 4.0 for data — matching the rest of the Solid stack.
