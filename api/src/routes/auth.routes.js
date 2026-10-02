import { Router } from 'express';

export function buildAuthRoutes({ controllers }) {
  const router = Router();

  router.post('/login', controllers.auth.login.bind(controllers.auth));

  router.post('/register', controllers.auth.register.bind(controllers.auth));

  return router;
}
