import { generateOpenApi } from '@ts-rest/open-api';
import { NextApiRequest, NextApiResponse } from 'next';

import { contract } from '@/api/contract';

const openApiDocument = generateOpenApi(contract, {
  info: {
    title: 'API',
    version: '1.0.0',
  },
});

export default function openApi(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(openApiDocument);
}
