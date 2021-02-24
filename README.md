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
- 🌍 [React i18next](https://react.i18next.com/)

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

### Setup VS code

**Create or edit your `.vscode/settings.json` file with the following code**

```json
{
  "i18n-ally.localesPaths": "src/locales"
}
```

### Development with Mirage and fakerjs

In `.env` file at the root of the project, do not set `NEXT_PUBLIC_API_BASE_URL` variable.

### Development with a jHipster backend

Create a `.env` file at the root of the project with the following content:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Show hint on development environments

Setup the `NEXT_PUBLIC_DEV_ENV_NAME` env variable with the name of the environment.

```
NEXT_PUBLIC_DEV_ENV_NAME=staging
NEXT_PUBLIC_DEV_ENV_COLOR_SCHEME=teal
```

## API Documentation

API documentation is accessible by admins in the app with [Swagger-UI](https://www.npmjs.com/package/swagger-ui-react). 
```
yarn docs:build
```
This will build the json documentation from the main file `/src/mocks/openapi/openapi.yaml`.

## Production

### NodeJS (recommended)

```
yarn build
yarn start
```

### Static

```
yarn static:build
```

Then expose the `/out` folder.

💡 You will need to setup your server to rewrite all `/app/*` urls to serve the `app.html` file.
