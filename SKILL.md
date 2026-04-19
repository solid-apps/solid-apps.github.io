---
name: solid-apps
description: Find working LOSOS apps that handle a urn:solid type, or contribute a new app to the catalog. Use when the user wants a real application (not just a demo) for some Solid data, or when packaging a LOSOS app for discoverability.
---

# solid-apps

Working LOSOS applications, one per directory. Each is a single-HTML-file app built on the full stack (LION + urn-solid + solid-schema + solid-panes + LOSOS) and ships with a catalog manifest declaring what `urn:solid:` types it handles.

```
LION  →  urn-solid  →  solid-schema  →  solid-panes  →  LOSOS  →  solid-apps (this)
```

## When to use this skill

- The user has Solid data of some `urn:solid:` type and wants a ready-to-use app for it.
- The user is building a new LOSOS app and wants to publish it for discovery.
- The user asks "what apps work with my pod?" or "what handles `urn:solid:X`?"

## Finding an app for a type

Reverse index maps each handled type to the apps that handle it:

```
curl -s https://solid-apps.github.io/reverse-index.json
# { "urn:solid:Tracker": ["/todos/"], "urn:solid:Vtodo": ["/todos/"], ... }
```

Catalog index has the full manifests: `https://solid-apps.github.io/index.json`.

## Anatomy of an app

```
todos/
  app.json        Catalog manifest (required)
  index.html      The app — opens at https://solid-apps.github.io/todos/
  ...             Optional: custom panes, sample data, screenshots
```

`app.json` shape (validated by `schema/app.schema.json`):

```json
{
  "name": "Todos",
  "description": "A list of tasks. Built on LOSOS's bespoke todo-pane via the urn:solid:Tracker manifest.",
  "entry": "./index.html",
  "types": ["urn:solid:Tracker", "urn:solid:Vtodo"],
  "icon": "\u2705",
  "author": "Melvin Carvalho",
  "status": "stable",
  "added": "2026-04-19"
}
```

## What's in an app's index.html

A typical app composes the stack:

```html
<!-- 1. JSON-LD data island, inline (or load from a pod via ?uri= query param) -->
<script type="application/ld+json">{ "@type": "Tracker", "issue": [...] }</script>

<!-- 2. Login (xlogin: Nostr NIP-07/NIP-98 + Solid OIDC/DPoP).
     One script tag adds the Login button and exposes window.xlogin.authFetch
     which LOSOS panes prefer over plain fetch for pod writes. -->
<script src="https://unpkg.com/xlogin"></script>

<!-- 3. Panes — declare which to load (LOSOS picks via canHandle) -->
<script type="module" data-pane src="https://losos.org/panes/todo-pane.js"></script>
<script type="module" data-pane src="https://losos.org/panes/schema-pane.js"></script>
<script type="module" data-pane src="https://solid-panes.github.io/schema-view.js"></script>
<script type="module" data-pane src="https://losos.org/panes/source-pane.js"></script>

<!-- 4. Mount point -->
<div id="losos"></div>

<!-- 5. Boot: autoSchema patches $schema based on @type, then shell -->
<script type="module">
  import { autoSchema } from 'https://solid-panes.github.io/auto-schema.js'
  await autoSchema()
  await import('https://losos.org/losos/shell.js')
</script>
```

That's the universal pattern. What changes between apps is mostly: the data, which panes are declared, and the type the manifest claims.

## Adding a new app

1. **Make sure the types you handle exist in urn-solid + have schemas in solid-schema + have manifests in solid-panes.** If not, add them upstream first.
2. Create `<slug>/` with `app.json` and `index.html`.
3. `npm run validate && npm run build`.
4. Commit + push.
5. The catalog (https://solid-apps.github.io/) and reverse-index update automatically.

## Authentication

xlogin (https://github.com/melvincarvalho/xlogin) is the auth layer of the stack — a single `<script src="https://unpkg.com/xlogin">` tag adds a Login button supporting both Nostr (NIP-07/NIP-98) and Solid (OIDC/DPoP). On login it exposes:

- `window.xlogin.type` — `"nostr"` or `"solid"`
- `window.xlogin.id` — the user's pubkey or WebID
- `window.xlogin.authFetch(url, opts)` — authenticated fetch (NIP-98 or DPoP based on login type)

LOSOS's panes already prefer `window.xlogin.authFetch` over plain `fetch` for writes — the pattern is `(window.xlogin && window.xlogin.authFetch) || fetch`. Adding the script tag is enough to enable real-pod writes; nothing else changes.

To target a real pod resource at runtime, the user appends `?uri=https://my.pod/today.jsonld` to the app URL. LOSOS's shell fetches it with `authFetch` and round-trips edits via authenticated PUT.

See https://github.com/melvincarvalho/xlogin/blob/gh-pages/SKILL.md for the full xlogin API.

## Don't

- Don't list types in `app.json#types` that aren't in urn-solid.
- Don't ship an app that depends on private LOSOS APIs — only use the URL-stable ones (`losos.org/losos/*.js`, `losos.org/panes/*.js`).
- Don't bundle LOSOS or panes into the app — fetch them at the stable URLs so updates propagate.
- Don't put pane *implementations* in solid-apps — they belong in LOSOS or solid-panes. solid-apps composes; it doesn't define new core machinery.

## Reference URLs

- Catalog: https://solid-apps.github.io/index.json
- By-type index: https://solid-apps.github.io/reverse-index.json
- Corpus: https://solid-apps.github.io/corpus.jsonl
- Manifest schema: https://solid-apps.github.io/schema/app.schema.json
- Site: https://solid-apps.github.io/

## Related skills

- `urn-solid` — vocabulary registry
- `solid-schema` — type contracts
- `solid-panes` — pane registry (which pane handles which type)
- `losos` — runtime
- `xlogin` — auth (Nostr + Solid). https://github.com/melvincarvalho/xlogin/blob/gh-pages/SKILL.md
