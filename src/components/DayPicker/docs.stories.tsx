import { Box } from '@chakra-ui/react';

import { DayPicker } from '.';

export default {
  title: 'components/HitZone',
  parameters: {
    docs: {
      description: {
        component: `The DayPicker component implement a DayPicker`,
      },
    },
  },
};
export const Default = () => (
  <Box name="Basic" height="400px">
    <DayPicker />
  </Box>
);
