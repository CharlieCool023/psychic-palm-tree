import app from '../src/api/boot';

export const config = {
  runtime: 'edge',
};

export default async function (req: Request) {
  return app.fetch(req);
}
