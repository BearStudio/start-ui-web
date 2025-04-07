import type { Meta } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default {
  title: 'Avatar',
} satisfies Meta<typeof Avatar>;

export function Default() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
      <AvatarFallback>CB</AvatarFallback>
    </Avatar>
  );
}

export function Size() {
  return (
    <Avatar className="size-12">
      <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
      <AvatarFallback>CB</AvatarFallback>
    </Avatar>
  );
}
