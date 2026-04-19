# solid-apps / preact

Experiment area inside [solid-apps](../). Starts with the simplest possible Preact render of a `urn:solid:` JSON-LD data island, then progressively pushes the limits until it either matches React-quality SPA output or we find where it breaks.

Lives here (not its own repo) because gh-pages and the data conventions are already set up — and because experimenting with apps is what this repo is for.

Each stage is a single self-contained HTML file (zero build). A stage graduates to real tooling only when CDN-ESM stops being enough — if it ever does.

## Stages

| Stage | Focus |
|-------|-------|
| 01-hello | Minimal Preact render: mount a `<Profile>` component, read JSON-LD from a `<script type="application/ld+json">` island, display it. Inspired by the Pivot profile layout at sharon.pivot-test.solidproject.org. Static; no state, no edits. |
| 02-inline-edit | `useState` for editable fields, debounced autosave that logs the would-be PUT body and writes back to the data island. Adds array editing (skills/languages pills with + add / × remove) — the thing ui-pane still defers. |
| 03-routing | Hand-rolled `useHashRoute` hook, persistent left sidebar nav, three views (Profile / Contacts / Calendar) in one SPA. One data island per view, typed. Read-only — edit is stage 2's concern, not repeated here. |
| 04-login | xlogin integration (Nostr/Solid). Listens for `xlogin`/`xlogout` events, shows the live identity in the sidebar, fetches the Solid WebID doc as JSON-LD after login, normalizes common foaf/vcard predicates, and overlays fetched values onto the sample island. Graceful fallback when the pod doesn't speak JSON-LD. |
| 05-discovery | TypeIndex discovery — fetches `solid:publicTypeIndex`, walks `solid:TypeRegistration` nodes for `solid:forClass` + `solid:instance`, and renders a Tasks view backed by the user's `wf:Tracker` resources in their pod. Settings exposes the registration list as a debug aid. No Turtle parser — relies on pods that serve JSON-LD via conneg. |
| 06-tasks | First focused single-purpose app: Tasks. Discovers `wf:Tracker` registrations via TypeIndex, fetches each, renders kanban columns. Add / toggle / edit / delete tasks → debounced PUT back to the pod via `xlogin.authFetch`. The closing of the read/write loop. |
| 07-combined | The synthesis: multi-view shell (Profile · Tasks · Contacts · Calendar · Settings) + Profile inline edit with WebID-doc-preserving write-back + Tasks full CRUD. `useEditableProfile` tracks the whole fetched JSON-LD doc so PUTs don't clobber pod-only fields (`solid:oidcIssuer`, `space:storage`, etc.). Real Solid editor in one HTML file. |
| 08+ | TBD — whatever the previous stages surface as the next limit. |

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
