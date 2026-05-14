# DG Vision Studio Client

Frontend application for DG Vision Studio, a photography portfolio and client gallery platform.

## Tech stack

- React
- TypeScript
- Vite
- React Router
- i18next / react-i18next
- Tailwind CSS
- Axios

## Features

- Public website pages
- Portfolio and albums
- Multilingual UI
- Dark/light theme support
- Authentication screens
- Client gallery access
- Admin panel routes
- Cookie/privacy/terms pages

## Local setup

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Environment variables

Create a local `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Example:

```env
VITE_API_URL=http://localhost:10000
```

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Related repository

Backend API:

```text
https://github.com/viktor132607/DGVisionStudio.Server
```
