import { Router } from 'express';
import { buildAuthRoutes } from './auth.routes.js';
import { jwtValidator } from '../middleware/jwt_validator..middleware.js';
import { publicTeamRoutes, secureTeamRoutes } from './team-security.js';

export function buildRoutes({ controllers }) {
  const router = Router();
  router.use(publicTeamRoutes());
  router.use(buildAuthRoutes({ controllers }));
  router.use(jwtValidator);
  router.use(secureTeamRoutes());
  return router;
}
