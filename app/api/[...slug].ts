import { handle } from 'hono/vercel';
import app from '../src/api/boot';

export default handle(app);
