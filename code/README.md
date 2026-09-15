# Campus Reserve — Thapar Institute

A redesigned campus resource and booking portal. The visual direction takes inspiration from White Desert's editorial composition, with original campus-specific layouts: architectural photography, warm paper, forest-green type, terracotta accents, square controls, fine rules, and an asymmetrical overview.

## Run locally

1. Install Node.js 22.12 or newer (verified with Node 24.20).
2. Extract the ZIP and open a terminal in `campus_resource_managment`, the folder containing `package.json`.
3. Run:

```sh
npm ci
npm run dev
```

4. Open the local URL printed in the terminal, normally http://localhost:5173. Keep the terminal running. Use Ctrl+C to stop.

If PowerShell blocks `npm.ps1`, use `npm.cmd ci` and `npm.cmd run dev` instead.

Do not double-click `index.html` or serve the source with Live Server. Vite transforms the TypeScript and resolves its dependencies. The entry sequence is `index.html` → `src/main.tsx` → `src/App.tsx`.

## Build and check

```sh
npm run build
npm run test:smoke
npm run preview
```

The production build is in `dist/`, also included in this archive. Preview normally opens at http://localhost:4173. If publishing the built folder elsewhere, configure the host to return `index.html` for application routes.

## What's included

- Editorial campus overview, society-specific booking totals, recent requests and campus directory links.
- Responsive horizontal navigation, mobile menu, account switching and notification panel.
- Redesigned sign-in screen with the existing demo personas.
- Availability schedule with location, room and date filters. Selecting an hourly slot carries the room, date and time into the booking form.
- Eight-step reservation form, contextual activity details, conflict checks, night-permission validation, request review and confirmation.
- Existing booking search, status filters, cancellation and booking details.
- In-charge approval/rejection flows and admin room/society management, with navigation synchronized to the relevant section.
- Keyboard-operable selection controls, visible focus styles, reduced-motion support and native dialogs with Escape handling and focus management.

New design files are in `src/design/`. Shared metrics, status indicators and dialogs are in `src/components/common/`. Existing business screens and booking logic remain in `src/pages/` and `src/services/`.

## Demo access and data

This is a frontend prototype, not a production authentication system. The root route opens the student demo by default. Open `/login` or the account menu to switch between student, permission in-charge and campus admin. Passwords are not verified.

Bookings, rooms, societies and notifications use browser localStorage. There is no backend, database service or `.env` configuration to install. The demo does not synchronize data across browsers or devices. Existing browser data is preserved.

## Stack

React 19, TypeScript 6, Vite 8, React Router 7, Tailwind CSS 4, and Lucide React. The original package dependencies and lockfile are preserved; `npm ci` installs the required versions.

## Image source

The Thapar Learning Laboratory photograph is served from the architect's site and requires internet access:

- https://mcculloughmulvin.com/projects/thapar-university-learning-centre

The photograph is credited in the interface and is not bundled in this archive. No open redistribution license was identified. A typographic fallback appears if the image cannot load. White Desert's text, photographs and implementation were not copied into the portal.

## Verification

The production build passed. All 32 smoke checks passed, covering rendering of the eight main screens, availability links, admin routing, unavailable rooms, booking conflict boundaries, approval/rejection/cancellation and notification state. The tests use isolated in-memory storage and do not alter browser data.

Automated browser visual and interaction testing could not run because a saved browser-access preference blocked the local preview. The responsive layouts are implemented, but a full visual review remains advisable.
