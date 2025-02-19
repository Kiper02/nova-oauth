import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TokenPayloadDto } from 'src/modules/user-info/dto/token-payload.dto';

@Injectable()
export class ClientAuthorizationGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers["authorization"]
    if(!accessToken) {
        throw new UnauthorizedException("Клиентский сервер не авторизован");
    }

    const token = accessToken.split(" ")[1];
    if(!token) {
        throw new UnauthorizedException("Клиентский сервер не авторизован");
    }
    const decodeToken: TokenPayloadDto = await this.jwtService.decode(token) as TokenPayloadDto;

    const dataAccess = await this.prismaService.accessToken.findFirst({
        where: {
            token,
            applicationId: decodeToken.applicationId
        }
    }) 

    if(!dataAccess) {
        throw new UnauthorizedException("Клиентский сервер не авторизован");
    }


    request.client = { decodeToken };
    return true;
  }
}
