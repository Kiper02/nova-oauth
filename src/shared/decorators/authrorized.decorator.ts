
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Authrorized = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
