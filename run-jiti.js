import { createJiti } from 'jiti';
import { fileURLToPath, URL } from 'node:url';

const moduleFileUrl = import.meta.url;

// eslint-disable-next-line no-undef
const pathToFile = process.argv[2];

// Allows aliases
const jiti = createJiti(fileURLToPath(moduleFileUrl), {
  alias: {
    '@': fileURLToPath(new URL('./src', moduleFileUrl)),
  },
});

await jiti.import(pathToFile);
