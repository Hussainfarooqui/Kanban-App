import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // We can override handleRequest if we want custom behavior
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
