import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadDto } from 'src/modules/user-info/dto/token-payload.dto';


export const ClientAuthorization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenPayloadDto => {
    const req = ctx.switchToHttp().getRequest();
    return req.client.decodeToken;
  },
);
