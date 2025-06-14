import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SearchButton } from '@/components/ui/search-button';

export default {
  title: 'SearchButton',
} satisfies Meta<typeof SearchButton>;

export function Default() {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <SearchButton
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
  return <SearchButton disabled />;
}

export function Loading() {
  return <SearchButton loading />;
}

export function Sizes() {
  return (
    <div className="flex gap-4">
      <SearchButton size="icon-sm" />
      <SearchButton size="icon" />
      <SearchButton size="icon-lg" />
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex gap-4">
      <SearchButton variant="ghost" />
      <SearchButton variant="secondary" />
      <SearchButton variant="default" />
    </div>
  );
}
