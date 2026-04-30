import { handle } from 'hono/vercel';

let handlerPromise: Promise<any>;

async function getHandler() {
  try {
    const module = await import('../src/api/boot');
    return handle(module.default);
  } catch (error: any) {
    return (req: any, res: any) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Initialization failed',
        message: error.message,
        stack: error.stack
      }));
    };
  }
}

handlerPromise = getHandler();

export default async function (req: any, res: any) {
  const handler = await handlerPromise;
  return handler(req, res);
}
