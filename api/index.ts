process.env.IS_SERVERLESS = '1';
process.env.VERCEL = '1';

import app from '../server';

export default function handler(req: any, res: any) {
  return app(req, res);
}
