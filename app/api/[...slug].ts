import { handle } from 'hono/vercel';
import app from '../dist/api.js';

export default handle(app);
