# Contributing to ScreenREC

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/screenREC.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make changes and commit
6. Push and open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+ (`npm install -g pnpm`)

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Or run specific apps
pnpm dev:web    # Frontend only
pnpm dev:api    # Backend only
```

### Project Structure

```
apps/web/src/
├── app/           # Next.js pages
├── components/    # React components
├── hooks/         # Custom React hooks
├── config/        # Configuration constants
├── services/      # API services
├── utils/         # Utility functions
└── types/         # TypeScript types
```

## Code Guidelines

### TypeScript

- Use strict TypeScript
- Define interfaces for props and state
- Avoid `any` — use `unknown` if type is truly unknown

### React

- Use functional components with hooks
- Extract logic into custom hooks
- Keep components focused and composable

### Styling

- Use Tailwind CSS utilities
- Follow mobile-first responsive design

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `VideoPreview.tsx` |
| Hooks | camelCase with `use` prefix | `useRecording.ts` |
| Utils | camelCase | `streamCombiner.ts` |
| Types | PascalCase | `RecordingLayout` |

## Pull Request Process

1. **Update tests** if applicable
2. **Run linting**: `pnpm lint`
3. **Run build**: `pnpm build`
4. **Write clear commit messages**
5. **Add screenshots** for UI changes
6. **Link related issues** in PR description

### Commit Message Format

```
type: short description

- Detail 1
- Detail 2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Reporting Issues

### Bug Reports

Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/recordings if applicable

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

[Open an issue](https://github.com/heysagnik/screenREC/issues/new/choose)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Questions?

Feel free to open a discussion or reach out to [@heysagnik](https://twitter.com/heysagnik).
