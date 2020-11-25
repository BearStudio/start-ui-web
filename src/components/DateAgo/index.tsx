import React, { FC } from 'react';

import { Tooltip, TooltipProps } from '@chakra-ui/react';
import dayjs from 'dayjs';

export interface DateAgoProps extends Omit<TooltipProps, 'children'> {
  date?: string | Date | dayjs.Dayjs;
  format?: string;
}

export const DateAgo: FC<DateAgoProps> = React.forwardRef(
  (
    { date = new Date(), format = 'dddd, DD MMMM YYYY [at] hh:mm a', ...rest },
    ref: any
  ) => {
    return (
      <Tooltip
        ref={ref}
        label={dayjs(date).format(format)}
        placement="top-start"
        {...rest}
      >
        {dayjs(date).fromNow()}
      </Tooltip>
    );
  }
);
