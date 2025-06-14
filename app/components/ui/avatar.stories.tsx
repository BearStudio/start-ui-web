import type { Meta } from '@storybook/react-vite';
import { User2Icon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default {
  title: 'Avatar',
} satisfies Meta<typeof Avatar>;

export function Default() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
      <AvatarFallback variant="initials" name="Cosmo Bear" />
    </Avatar>
  );
}

export function Size() {
  return (
    <Avatar className="size-12">
      <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
      <AvatarFallback variant="initials" name="Cosmo Bear" />
    </Avatar>
  );
}

export function Icon() {
  return (
    <Avatar>
      <AvatarFallback>
        <User2Icon className="size-4 opacity-40" />
      </AvatarFallback>
    </Avatar>
  );
}

export function Initials() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback variant="initials" name="Cosmo Bear" />
        </Avatar>
        <Avatar>
          <AvatarFallback variant="initials" name="Ivan Dalmet" />
        </Avatar>
        <Avatar>
          <AvatarFallback variant="initials" name="Yoann Fleury" />
        </Avatar>
      </div>
    </div>
  );
}

export function Boring() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback variant="boring" name="Cosmo Bear" />
        </Avatar>
        <Avatar>
          <AvatarFallback variant="boring" name="Ivan Dalmet" />
        </Avatar>
        <Avatar>
          <AvatarFallback variant="boring" name="Yoann Fleury" />
        </Avatar>
      </div>
    </div>
  );
}
