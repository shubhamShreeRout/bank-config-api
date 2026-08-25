import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './auth.types';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]) || [];
    return (
      roles.length === 0 ||
      roles.some((role) => ctx.switchToHttp().getRequest().user?.roles?.includes(role)) ||
      (() => {
        throw new ForbiddenException();
      })()
    );
  }
}
