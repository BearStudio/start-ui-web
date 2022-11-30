// @ts-check
const { z } = require("zod");

/**
 * Update this when adding/editing/removing environment variables
 */

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),

  NEXT_PUBLIC_DEV_ENV_NAME: z.string().optional(),
  NEXT_PUBLIC_DEV_ENV_COLOR_SCHEME: z.string().optional(),
});

/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 */

const _env = envSchema.safeParse(process.env);

const formatErrors = (
  /** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */
  errors,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

if (!_env.success) {
  console.error(
    "❌ Invalid environment variables\n👇 Fix the following environment variables or update the `.env.validator.js` file.\n",
    ...formatErrors(_env.error.format()),
  );
  process.exit(1);
}

console.log('✅ Environment variables validation')

module.exports = {
  envSchema
}
