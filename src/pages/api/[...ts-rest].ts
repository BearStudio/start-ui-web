import { ResponseValidationError } from '@ts-rest/core';
import { createNextRouter } from '@ts-rest/next';
import { NextApiRequest, NextApiResponse } from 'next';

import { contract } from '@/api/contract';
import { router } from '@/api/server';

// Actually initiate the collective endpoints
export default createNextRouter(contract, router, {
  jsonQuery: true,
  responseValidation: true,
  errorHandler: (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (error instanceof ResponseValidationError) {
      console.log(error.cause);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
});
