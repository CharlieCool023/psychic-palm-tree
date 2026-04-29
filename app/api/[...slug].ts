import { handle } from 'hono/vercel';
import app from '../src/api/boot';

// Vercel Serverless Function
export default handle(app);
