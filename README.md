# Op Notes

A cross-platform desktop application for managing surgical notes in hospitals. Built with Electron, React, and SQLite.

## Features

- **Patient Management**: Track patient records with PHN, demographics, and contact information
- **Surgery Records**: Document surgeries with operation notes, post-op notes, and follow-ups
- **Doctor Management**: Maintain doctor profiles with designations and SLMC registration
- **Full-Text Search**: Quickly find patients, surgeries, and doctors
- **Print Support**: Generate printable operation notes and follow-up records
- **Offline-First**: All data stored locally in SQLite database

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Electron 28, SQLite (better-sqlite3), Kysely
- **Build**: electron-vite, electron-builder
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack React Query

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### Other Commands

```bash
$ pnpm lint          # Run ESLint with auto-fix
$ pnpm typecheck     # TypeScript type checking
$ pnpm format        # Format code with Prettier
```

## Project Structure

```
src/
├── main/            # Electron main process
│   ├── db/          # Database migrations
│   └── repository/  # Data access layer
├── preload/         # Electron preload scripts (IPC bridge)
├── renderer/        # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── routes/      # Page components
│       ├── contexts/    # React Context providers
│       └── hooks/       # Custom React hooks
└── shared/          # Shared types and models
```

## Community

Join our WhatsApp community to get instant support, share feedback, and connect with other users.

<a href="https://chat.whatsapp.com/L4LMwxsbjPk514I1ToRris">
  <img src="resources/whatsapp-qr.png" alt="WhatsApp Community QR Code" width="150" />
</a>

[Join WhatsApp Community](https://chat.whatsapp.com/L4LMwxsbjPk514I1ToRris)

## License

MIT
