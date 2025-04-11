<h1 align="center"><img src=".github/assets/thumbnail.png" alt="Start UI Web" /></h1>

[![Discord](https://img.shields.io/discord/452798408491663361)](https://go.bearstudio.fr/discord)

🚀 Start UI <small>[web]</small> is an opinionated frontend starter repository created & maintained by the [BearStudio Team](https://www.bearstudio.fr/team) and other contributors.
It represents our team's up-to-date stack that we use when creating web apps for our clients.

# Install

```
cp .env.example .env # Setup your env variables
cp .vscode/settings.example.json .vscode/settings.json  # (Optionnal) Setup your VS Code
pnpm install # Install dependencies
pnpm dk:init # Init docker
pnpm db:init # Init the db
```

# Run

```
pnpm dk:start # Only if your docker is not running
pnpm dev
```

# Work in progress 3.0.0

- [x] 🔥 Burn all the code
- [x] Setup Tanstack Start
- [x] Setup Tailwind
- [x] Setup Shadcn
- [x] Setup Storybook
- [x] Prisma
- [x] Docker
- [x] Vitest
- [x] Open API /api/openapi/app & /api/openapi/auth
- [ ] Logs
- [ ] Fields
- [x] Translations
- [ ] Auth

---

- [ ] Deployment (vercel)
- [ ] Demo
- [ ] Update README
- [ ] Update documentation
