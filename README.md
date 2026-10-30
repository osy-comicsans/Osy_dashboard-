# RoadWatch

Accident statistics and area monitoring for Algeria.

The interface uses solid neutral surfaces and a restrained aqua accent. Shared
tokens live in `vite-version/src/styles/tokens.css`, with map styles in
`vite-version/src/styles/leaflet-theme.css`.

## Run locally

Use Node.js 24 and pnpm.

```sh
cd vite-version
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:5173](http://localhost:5173).

## Pages

- **Statistics** (`/statistics`): accident totals, trends, driver and vehicle
  records, report details, and CSV export.
- **Accident map** (`/map`): Leaflet map with severity markers and selectable
  accident locations.

Both pages share filters for app usage, online/offline alerts, area, severity,
date range, and record search. Filters are preserved in the URL.

## Data

The app currently uses 48 fictional reports across eight Algerian areas.
Driver names, phone numbers, identity cards, vehicle records, and accident
locations are demonstration values. No live reporting service is connected.

Sample periods end on 30 October 2026. Data and the reference date live in
`vite-version/src/features/accidents/data.ts`.

The base map uses OpenStreetMap tiles and needs an internet connection.

## Checks

Run these commands from `vite-version`:

```sh
pnpm lint
pnpm build
pnpm test:e2e
```

Install the browser for tests with `pnpm exec playwright install chromium`.
The browser tests start a development server if needed.

## Project files

- `vite-version/src/app/`: statistics and map pages.
- `vite-version/src/features/accidents/`: shared accident data and UI.
- `vite-version/src/components/`: dashboard layout and UI components.
- `vite-version/e2e/`: browser tests.
- `License.md`: applicable MIT license notice.
