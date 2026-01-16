import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { useState } from 'react';

export function Chat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex h-screen max-w-2xl flex-col bg-muted">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'
            }`}
          >
            <div className="mb-1 font-semibold">
              {message.role === 'assistant' ? 'Assistant' : 'You'}
            </div>
            <div>
              {message.parts.map((part, idx) => {
                if (part.type === 'thinking') {
                  return (
                    <div
                      key={idx}
                      className="text-gray-500 mb-2 text-sm italic"
                    >
                      💭 Thinking: {part.content}
                    </div>
                  );
                }
                if (part.type === 'text') {
                  return <div key={idx}>{part.content}</div>;
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border px-4 py-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 rounded-lg px-6 py-2 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
