import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class UserInfoService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async getUserInfo(tokenPayloadDto: TokenPayloadDto) {
    const { applicationId, userId } = tokenPayloadDto;
    const account = await this.prismaService.account.findFirst({
      where: {
        applicationId,
        userId,
      },
    });
    if (!account) {
      throw new BadRequestException('Аккаунт не найден');
    }
    const url = this.configService.getOrThrow<string>('ACCOUNT_API_SERVER');

    let user;
    try {
      const response = await axios.get(`${url}/user/info`, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      user = response.data;

      if (response.status === 401) {
        try {
          const userData = await axios.post(`${url}/auth/refresh`, {
            headers: {
              Authorization: `Bearer ${account.refreshToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (userData.status === 401) {
            throw new UnauthorizedException('Refresh токен пользователя истёк');
          }

          await this.prismaService.account.update({
            where: {
              id: account.id,
            },
            data: {
              accessToken: userData.data.accessToken,
              refreshToken: userData.data.refreshToken,
            },
          });
          const newResponse = await axios.get(`${url}/user/info`, {
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          const user = newResponse.data;
          return {
            name: user.name,
            email: user.email,
            displayName: user.displayName,
            age: user.age,
            picture: user.age,
            male: user.male,
            phone: user.phone,
          };
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }
      return {
        name: user.name,
        email: user.email,
        displayName: user.displayName,
        age: user.age,
        picture: user.age,
        male: user.male,
        phone: user.phone,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
