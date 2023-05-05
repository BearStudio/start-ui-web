'use client';

import { Button } from '@chakra-ui/react';

import { useAccount } from '@/spa/account/account.service';

export default function Home() {
  const user = useAccount();
  console.log(user);
  return (
    <div>
      Home
      <Button variant="@primary">Hello</Button>
    </div>
  );
}
