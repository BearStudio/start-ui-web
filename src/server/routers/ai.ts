import { chat, toolDefinition, toServerSentEventsResponse } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';
import { z } from 'zod';

import { zBook } from '@/features/book/schema';
import { db } from '@/server/db';
import { aiMiddleware, protectedProcedure } from '@/server/orpc';

const tags = ['ai'];

// Step 1: Define the tool schema
const getBooksDef = toolDefinition({
  name: 'get_books',
  description: 'Get the books from the database',
  outputSchema: z.array(zBook()),
});

// Step 2: Create a server implementation
const getBooksServer = getBooksDef.server(async () => {
  return await db.book.findMany();
});

export default {
  chat: protectedProcedure({ permission: { apps: ['manager'] } })
    .use(aiMiddleware)
    .route({ method: 'POST', path: '/ai/chat', tags })
    .input(
      z.object({
        messages: z.array(z.string()),
        conversationId: z.string(),
      })
    )
    .handler(async ({ input }) => {
      try {
        // Create a streaming chat response
        const stream = chat({
          adapter: openaiText('gpt-4o-mini'),
          messages: input.messages.map((message) => ({
            role: 'user',
            content: message,
          })),
          conversationId: input.conversationId,
          tools: [getBooksServer],
        });

        // Convert stream to HTTP response
        return toServerSentEventsResponse(stream);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'An error occurred',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }),
};
