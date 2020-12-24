⚠️ Work in progress repository

# Start UI

Opinionated UI starter with
- 🟦 [TypeScript](https://www.typescriptlang.org/)
- ⚛️ [React](https://reactjs.org/)
- ▲ [NextJS](https://nextjs.org/) with [Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- ⚛️ [React Router](https://reactrouter.com/)
- ⚡️ [Chakra UI](https://chakra-ui.com/)
- ⚛️ [React Query](https://react-query.tanstack.com/)
- 🐜 [Formiz](https://formiz-react.com/)
- 💥 [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
- ⭐️ [React Icons](https://react-icons.github.io/react-icons/)

ℹ️ API calls are mapped on a [jHipster](https://www.jhipster.tech/) backend application.

## Installation

```
yarn install
yarn build
```

## Development

```
yarn dev
```

### Development with a jHipster backend

Create a `.env` file at the root of the project with the following content:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### i18n

We use [i18next](https://www.i18next.com/) and [react-18next](https://react.i18next.com/) to handle translations in this project

All translation files are stored inside the `src/i18n` folder.
Each file inside a language folder corresponds to a subfolder of the `app`, `components`, `errors`... folders.
Each file is mapped by i18next as a **namespace**.
