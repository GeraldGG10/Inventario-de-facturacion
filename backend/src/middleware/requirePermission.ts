import { NextFunction, Request, Response } from 'express';

export function requirePermission(permiso: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    if (!req.auth.permisos.includes(permiso)) {
      return res.status(403).json({ error: `No tienes el permiso requerido: ${permiso}` });
    }
    next();
  };
}
