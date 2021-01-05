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

## Show hint on development environments

Setup the `NEXT_PUBLIC_ENV_NAME` env variable with the name of the environment.

```
NEXT_PUBLIC_ENV_NAME=staging
```