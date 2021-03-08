import React, { useEffect, useState } from 'react';

import { Flex, Progress } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import { Viewport } from '@/components';

const Loading = () => (
  <Viewport>
    <Flex flex="1" align="flex-start">
      <Progress
        w="full"
        h="0.4rem"
        bg="gray.100"
        colorScheme="brand"
        isIndeterminate
      />
    </Flex>
  </Viewport>
);

const AppComponent = dynamic(() => import('@/app/App').then((mod) => mod.App), {
  ssr: false,
  loading: () => <Loading />,
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return isLoading ? <Loading /> : <AppComponent />;
};
export default App;
