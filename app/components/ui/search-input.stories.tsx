import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';

export default {
  title: 'SearchInput',
} satisfies Meta<typeof SearchInput>;

export function Default() {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={searchTerm}
        onChange={(value) => setSearchTerm(value ?? '')}
      />
      <p className="text-sm text-muted-foreground">
        {searchTerm ? `Search term is ${searchTerm}` : 'No search term'}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={searchTerm === 'Start UI'}
          size="xs"
          variant="secondary"
          onClick={() => setSearchTerm('Start UI')}
        >
          Set to "Start UI"
        </Button>
        <Button
          disabled={searchTerm === 'React'}
          size="xs"
          variant="secondary"
          onClick={() => setSearchTerm('React')}
        >
          Set to "React"
        </Button>
        <Button
          disabled={searchTerm === 'TypeScript'}
          size="xs"
          variant="secondary"
          onClick={() => setSearchTerm('TypeScript')}
        >
          Set to "TypeScript"
        </Button>
        <Button
          disabled={searchTerm === ''}
          size="xs"
          variant="secondary"
          onClick={() => setSearchTerm('')}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export function Disabled() {
  return <SearchInput disabled />;
}

export function Loading() {
  return <SearchInput loading />;
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      <SearchInput size="sm" />
      <SearchInput size="default" />
      <SearchInput size="lg" />
    </div>
  );
}

export function DebounceDelay() {
  const [searchTerm, setSearchTerm] = useState('');
  const [delay, setDelay] = useState(500);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          size="xs"
          variant={delay === 0 ? 'default' : 'secondary'}
          onClick={() => setDelay(0)}
        >
          No delay
        </Button>
        <Button
          size="xs"
          variant={delay === 200 ? 'default' : 'secondary'}
          onClick={() => setDelay(200)}
        >
          200ms
        </Button>
        <Button
          size="xs"
          variant={delay === 500 ? 'default' : 'secondary'}
          onClick={() => setDelay(500)}
        >
          500ms (default)
        </Button>
        <Button
          size="xs"
          variant={delay === 1000 ? 'default' : 'secondary'}
          onClick={() => setDelay(1000)}
        >
          1000ms
        </Button>
      </div>
      <SearchInput
        value={searchTerm}
        onChange={(value) => setSearchTerm(value ?? '')}
        delay={delay}
      />
      <p className="text-sm text-muted-foreground">
        {searchTerm ? `Search term is ${searchTerm}` : 'No search term'}
      </p>
    </div>
  );
}
