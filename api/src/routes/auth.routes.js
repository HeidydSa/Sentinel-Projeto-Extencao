import { Router } from 'express';
import { jwtValidator } from '../middleware/jwt_validator..middleware.js';
export function buildAuthRoutes({ controllers }) {
  const router = Router();
  const auth = controllers.auth;
  router.post('/auth/login', auth.login.bind(auth));
  router.post('/auth/register', auth.register.bind(auth));
  router.get('/auth/roles', auth.roles.bind(auth));
  router.get('/auth/me', jwtValidator, auth.me.bind(auth));
  router.put('/auth/me', jwtValidator, auth.profile.bind(auth));
  router.delete('/auth/me', jwtValidator, auth.removeAccount.bind(auth));
  return router;
}
