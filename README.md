# ko-tools

A small collection of personal calculators, built with Vite + React + React Router.

| Path | Tool |
|---|---|
| `/` | Home: links to every tool |
| `/calories` | Daily calorie visualizer |
| `/projection` | Money projection |

## Development

```sh
npm install
npm run dev
```

## Adding a tool

1. Create `src/pages/<name>/<Name>Page.jsx`.
2. Add an entry to `TOOLS` in `src/tools.jsx`. That registers the route and adds it to the home page.

## Deploying

`npm run build` outputs to `dist/`. Configure your host to serve `index.html` for every path (SPA fallback) so routes like `/projection` work on reload.
