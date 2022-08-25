import { Box, Code, Icon, Text } from '@chakra-ui/react';

import { useRtl } from '@/hooks/useRtl';

export default {
  title: 'Hooks/useRtl',
};

export const Default = () => {
  const { direction, rtlValue } = useRtl();

  return (
    <Box>
      <Text>
        This hook is returning the direction of the text and the rtlValue (rtl
        meaning Right to Left) which can have either value 'rtl' or value 'ltr'.
      </Text>
      <Text>
        Thank's to that, we can change the behavior of some component (when the
        arabic language is selected for example).
      </Text>
      <Text>Components will be computed based on the direction.</Text>
      <Text>Current rtlValue : {rtlValue('left', 'right')}</Text>
      <Text>Current direction : {direction}</Text>
      <Code>
        rtlValue('what to do when it is rigth to left direction', 'what to do
        when it is left to right direction')
      </Code>
    </Box>
  );
};
