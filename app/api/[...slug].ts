import app from '../src/api/boot';

// Vercel Serverless Function using Fetch API
export default async (req: Request): Promise<Response> => {
  return app.fetch(req);
};
