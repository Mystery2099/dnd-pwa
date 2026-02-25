# Grimar - D&D 5e Progressive Web App

A self-hosted, offline-capable D&D 5e reference tool built with modern web technologies.

## 🚀 Quick Start

All commands run from the **project root** - no need to cd anywhere:

```bash
# Install dependencies (first time only)
bun install

# Start development server
bun run dev              # Runs on localhost:5173

# Run tests
bun run test:run         # Unit tests
bun run test:e2e         # E2E tests

# Build for production
bun run build
bun run start            # Run production server
```

## 📁 Project Structure

```
dnd-pwa/
├── grimar/              # Main application workspace
│   ├── src/             # Source code
│   ├── tests/           # E2E tests
│   └── package.json     # App dependencies
├── docs/                # Complete documentation
└── package.json         # Workspace root (proxies commands to grimar/)
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[docs/README.md](./docs/README.md)** | Documentation index and project status |
| **[docs/SPECIFICATIONS.md](./docs/SPECIFICATIONS.md)** | Feature specifications |
| **[docs/architecture-doc.md](./docs/architecture-doc.md)** | Technical architecture |
| **[docs/STYLE_GUIDE.md](./docs/STYLE_GUIDE.md)** | "Arcane Aero" design system |

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 Runes
- **Runtime**: Bun (not Node.js)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **State**: TanStack Query
- **Testing**: Vitest + Playwright

## 🎯 Key Features

- Multi-provider compendium (Open5e, SRD, Homebrew)
- Full-text search with FTS5
- Offline-capable PWA
- Header-based authentication (reverse proxy)
- 7-theme "Arcane Aero" design system

## 📝 Common Commands

```bash
# Development
bun run dev              # Dev server
bun run check            # Type checking
bun run format           # Format code
bun run lint             # Lint code

# Testing
bun run test:run         # Unit tests (CI mode)
bun run test:e2e         # Playwright E2E
bun run test:all         # All tests

# Database
bun run db:push          # Push schema (dev)
bun run db:studio        # Drizzle Studio UI
bun run db:sync          # Sync compendium data
bun run reindex-fts      # Rebuild search index

# Production
bun run build            # Build app
bun run start            # Run production server
```

## 🔧 Development Workflow

1. Read [docs/README.md](./docs/README.md) for project overview and guidelines
2. Run `bun run dev` to start development
3. Run `bun run check` and `bun run test:run` before committing
4. See [docs/](./docs/) for detailed documentation

## 📄 License

[MIT](./LICENSE)
