import OpenAI from 'openai';

import { envServer } from '@/env/server';

export const openai = new OpenAI({
  apiKey: envServer.OPENAI_API_KEY,
});
