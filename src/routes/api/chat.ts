import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';
import { createFileRoute } from '@tanstack/react-router';

import { envServer } from '@/env/server';
import { getBooksServer } from '@/features/ai/tools';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Check for API key
        if (!envServer.OPENAI_API_KEY) {
          return new Response(
            JSON.stringify({
              error: 'OPENAI_API_KEY not configured',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const { messages, conversationId } = await request.json();

        try {
          // Create a streaming chat response
          const stream = chat({
            systemPrompts: [
              'Tu es un assistant qui doit trouver les livres dans la base de données',
              'Tu ne fais que donner des livres correspondants à la requête si jamais il en existe',
              'Réponds sous forme de liste à puce avec les titres des livres et leur auteur',
            ],
            adapter: openaiText('gpt-4.1-mini'),
            messages: messages,
            conversationId,
            tools: [getBooksServer],
          });

          // Convert stream to HTTP response
          return toServerSentEventsResponse(stream);
        } catch (error) {
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : 'An error occurred',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      },
    },
  },
});
