import { Router } from 'express';

export function buildAuthRoutes({ controllers }) {
  const router = Router();

  router.post('/auth/login', controllers.auth.login.bind(controllers.auth));

  router.post(
    '/auth/register',
    controllers.auth.register.bind(controllers.auth)
  );

  return router;
}
