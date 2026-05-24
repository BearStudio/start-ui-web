import { User2Icon } from 'lucide-react';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/platform/components/ui/avatar';
function Default() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
      <AvatarFallback variant="initials" name="Cosmo Bear" />
    </Avatar>
  );
}

function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
      </Avatar>
    </div>
  );
}

function Icon() {
  return (
    <Avatar>
      <AvatarFallback>
        <User2Icon className="size-4 opacity-40" />
      </AvatarFallback>
    </Avatar>
  );
}

function Initials() {
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

function Boring() {
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

function WithBadge() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
        <AvatarBadge />
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/avatar.jpg" alt="@cosmobear" />
        <AvatarFallback variant="initials" name="Cosmo Bear" />
        <AvatarBadge />
      </Avatar>
    </div>
  );
}

function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback variant="boring" name="Cosmo Bear" />
      </Avatar>
      <Avatar>
        <AvatarFallback variant="boring" name="Ivan Dalmet" />
      </Avatar>
      <Avatar>
        <AvatarFallback variant="boring" name="Yoann Fleury" />
      </Avatar>
      <AvatarGroupCount>+2</AvatarGroupCount>
    </AvatarGroup>
  );
}

function GroupSizes() {
  return (
    <div className="flex flex-col gap-4">
      <AvatarGroup>
        <Avatar size="sm">
          <AvatarFallback variant="boring" name="Cosmo Bear" />
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback variant="boring" name="Ivan Dalmet" />
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback variant="boring" name="Yoann Fleury" />
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        <Avatar size="default">
          <AvatarFallback variant="boring" name="Cosmo Bear" />
        </Avatar>
        <Avatar size="default">
          <AvatarFallback variant="boring" name="Ivan Dalmet" />
        </Avatar>
        <Avatar size="default">
          <AvatarFallback variant="boring" name="Yoann Fleury" />
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        <Avatar size="lg">
          <AvatarFallback variant="boring" name="Cosmo Bear" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback variant="boring" name="Ivan Dalmet" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback variant="boring" name="Yoann Fleury" />
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}

export default {
  Default,
  Sizes,
  Icon,
  Initials,
  Boring,
  WithBadge,
  Group,
  GroupSizes,
};
