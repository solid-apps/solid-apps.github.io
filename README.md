# solid-apps

Working LOSOS applications built on the [LION](https://linkedobjects.org/) + [urn-solid](https://urn-solid.com/) + [solid-schema](https://solid-schema.github.io/) + [solid-panes](https://solid-panes.github.io/) + [LOSOS](https://losos.org/) stack.

Each app is a single-HTML-file application that handles one or more `urn:solid:` types. Open the URL to use it.

## Apps

```
todos/  →  https://solid-apps.github.io/todos/
```

(Catalog at https://solid-apps.github.io/ updates as more apps land.)

## Repo layout

```
<slug>/                     One app per directory
  index.html                The app entry point (open this URL to use it)
  app.json                  Catalog manifest (name, description, types handled, etc.)
  ...                       Custom panes, data, assets as needed
schema/app.schema.json      Meta-schema for app.json
scripts/validate.js         Validate every app.json + check entry exists
scripts/build.js            Generate index.json catalog + reverse-index by type
index.html                  Catalog landing page
index.json                  Generated: slug → catalog entry
reverse-index.json          Generated: urn:solid:Type → array of app slugs
corpus.jsonl                Generated: every manifest, one per line
```

## Adding an app

```bash
mkdir my-app
# write my-app/app.json (see schema/app.schema.json)
# write my-app/index.html (the actual application)
npm run validate
npm run build
git commit -am "add: my-app"
git push
```

## License

[AGPL-3.0](LICENSE)
