import { Hono } from 'hono';
const authCallbackRouter = new Hono().get('/google', async (c) => {
  return c.redirect('/auth/sign-in');
});
export default authCallbackRouter;
