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
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }
      
      const isTrpc = req.url && req.url.includes('/trpc');
      const errorMsg = 'Initialization failed: ' + error.message;
      
      if (isTrpc) {
        res.end(JSON.stringify([{
          error: {
            message: errorMsg,
            code: -32603,
            data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500, stack: error.stack }
          }
        }]));
      } else {
        res.end(JSON.stringify({ error: 'Initialization failed', message: error.message, stack: error.stack }));
      }
    };
  }
}

handlerPromise = getHandler();

export default async function (req: any, res: any) {
  const handler = await handlerPromise;
  return handler(req, res);
}
