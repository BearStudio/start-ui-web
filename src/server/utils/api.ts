import { NextApiRequest, NextApiResponse } from 'next';

type HttpVerbs = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
type Methods = {
  [key in HttpVerbs]?: {
    public?: boolean;
    handler(req: NextApiRequest, res: NextApiResponse): Promise<unknown>;
  };
};

export const badRequest = (res: NextApiResponse) => {
  return res.status(400).end();
};

export const notSignedIn = (res: NextApiResponse) => {
  return res.status(401).end();
};

export const notFound = (res: NextApiResponse) => {
  return res.status(404).end();
};

export const apiMethods =
  (methods: Methods = {}) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method && methods[req.method as keyof typeof methods];

    if (!method) {
      return res.status(405).end();
    }

    return method.handler(req, res);
  };
