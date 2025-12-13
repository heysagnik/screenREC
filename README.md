<img src="https://api.microlink.io/?url=https%3A%2F%2Fscreen-rec.vercel.app%2F&overlay.browser=dark&overlay.background=linear-gradient(225deg%2C%20%23FF6B6B%200%25%2C%20%235F27CD%2050%25%2C%20%231DD1A1%20100%25)&screenshot=true&meta=false&embed=screenshot.url"/>

# <img src="https://em-content.zobj.net/source/apple/391/video-camera_1f4f9.png" height="36"/> ScreenREC

A modern, privacy-first web screen recorder. No ads, no time limits, no data collection.

<a href="https://www.producthunt.com/posts/screenrec?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-screenrec" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=322532&theme=dark" alt="ScreenREC - A really simple ad-free minimial web screen recorder | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## About

The project was initially developed by [Sagnik Sahoo](https://twitter.com/heysagnik) during the COVID-19 era to record online classes. Later, it was made open-source.

**V1 (Legacy)**: Built with Pug, Parcel, and SASS — a simple single-page recorder. [Try V1 →](https://screen-rec-legacy.vercel.app/)


**V2 (Current)**: Complete rewrite using Next.js, React, and TypeScript with camera overlay, multiple export formats, and keyboard shortcuts.


## Features

- **Screen Recording** — Capture screen, window, or browser tab
- **Camera Overlay** — Picture-in-picture webcam with draggable positioning
- **Microphone Audio** — Record system audio and microphone
- **Multiple Layouts** — PiP and circle camera overlay modes
- **Export Formats** — WebM (native) and MP4 (server-converted)
- **Keyboard Shortcuts** — Ctrl+P (pause), Ctrl+M (mic), Ctrl+C (camera), Ctrl+S (screen)
- **No Time Limits** — Record as long as you need
- **Privacy First** — All processing happens locally

## Demo

<a href="https://screen-rec.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Try%20ScreenREC-Live%20Demo-5F27CD?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Build | Turborepo, pnpm |
| Backend | Express.js (for MP4 conversion) |
| Deployment | Vercel (web), Railway (API) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/heysagnik/screenREC.git
cd screenREC

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm dev:web` | Start only the web app |
| `pnpm dev:api` | Start only the API server |

### Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fheysagnik%2FscreenREC)

## Project Structure

```
screenREC/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend (MP4 conversion)
├── packages/
│   └── shared/       # Shared utilities
└── turbo.json        # Turborepo config
```

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported |
| Firefox | ✅ Supported |
| Safari | ✅ Supported |
| Mobile | ❌ Not supported (getDisplayMedia limitation) |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE.md](LICENSE.md)

## Contributors

<img src="https://contrib.rocks/image?repo=heysagnik/screenREC" />

---

Maintained by [Sagnik Sahoo](https://github.com/heysagnik)