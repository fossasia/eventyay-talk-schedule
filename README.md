# pretalx-schedule

## Project setup

```sh
bun i
```

### Compiles and hot-reloads for development

```sh
bun run start
```

### Compiles and minifies for production

```sh
bun run build
```

### Build for pretalx (web component)


```sh
bun run build:wc
```

Then copy the built files (saved in _dist_) to the project which wants to use this web component.
See the usage in _wc-demo_ folder.

### Try the Web Component demo

Build and copy the JS files from _dist_ to _wc-demo_.
Serve this directory with a simple HTTP server:

```sh
python3 -m http.server -d wc-demo  
```
