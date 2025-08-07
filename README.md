# pretalx-schedule

## Project setup
```
bun i
```

### Build for pretalx (web component)
```
bun run build:wc
```

After that, copy the JS files in _dist_ folder to pretalx

### Preview

Use Python simple web server to host the built files:

```
python3 -m http.server -d dist 8008
```

### Compiles and hot-reloads for development

Later on, you can run:

```
bun run start
```

but it doesn't work yet, due to something wrong with our Webpack configuration. We hope to fix it later.

### Release library to npm

```sh
npm version minor|patch
npm publish --access=public
```

### Lints and fixes files
```
npm run lint
```
