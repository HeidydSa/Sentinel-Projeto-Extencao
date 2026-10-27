import { isJwtToken } from '../utils/typeValidations.js';
import jwt from 'jsonwebtoken';

export const jwtValidator = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!isJwtToken(authHeader)) {
    return res.status(401).json({ message: 'Token de autenticação ausente' });
  }

  const tokenParts = authHeader.split(' ');

  try {
    const authorizedUser = jwt.verify(tokenParts[1], process.env['JWT_SECRET']);

    req.user = authorizedUser;
    next();
  } catch {
    return res.status(403).json({ message: 'Usuário não está autorizado' });
  }
};
