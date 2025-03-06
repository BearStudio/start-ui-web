<h1 align="center"><img src=".github/assets/thumbnail.png" alt="Start UI Web" /></h1>

[![Discord](https://img.shields.io/discord/452798408491663361)](https://go.bearstudio.fr/discord)

🚀 Start UI <small>[web]</small> is an opinionated frontend starter repository created & maintained by the [BearStudio Team](https://www.bearstudio.fr/team) and other contributors.
It represents our team's up-to-date stack that we use when creating web apps for our clients.

# Work in progress 3.0.0

- [x] 🔥 Burn all the code
- [x] Setup Tanstack Start
- [x] Setup Tailwind
- [x] Setup Shadcn
- [x] Setup Storybook
- [x] Prisma
- [x] Docker
- [x] Vitest
- [ ] Logs
- [ ] Fields
- [ ] Translations
- [ ] Auth

---

- [ ] Demo
- [ ] Update README
- [ ] Update documentation

# VS code setup

Update your `.vscode/settings`

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(((?:[^()]|\\([^()]*\\))*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(((?:[^()]|\\([^()]*\\))*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```
