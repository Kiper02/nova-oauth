import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.session?.userId;
    if (!userId) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId
      }
    })

    if(!user) {
      throw new UnauthorizedException('Пользователь не авторизован')
    }

    request.user = user;
    return true;
  }
}
