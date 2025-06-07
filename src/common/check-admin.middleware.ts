import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CheckAdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const adminSecret = process.env.ADMIN_SECRET;
    const reqSecret = req.headers['x-admin-secret'];

    if (!adminSecret || reqSecret !== adminSecret) {
      throw new ForbiddenException('Admin access denied!');
    }
    next();
  }
}