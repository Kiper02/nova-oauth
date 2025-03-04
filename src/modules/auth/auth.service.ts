import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { convertTime } from 'src/shared/utils/convert-time';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { saveCookie } from 'src/shared/utils/session.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(dto: LoginDto, res: Response, req: Request) {
    const { clientId, email, password } = dto;

    const isExistApplication = await this.prismaService.application.findUnique({
      where: {
        clientId,
      },
    });

    if (!isExistApplication) {
      throw new NotFoundException('Приложение не найдено');
    }

    const tokens =
      req.cookies[this.configService.getOrThrow<string>('COOKIE_NAME')];
    if (tokens) {
      const user = await this.getUser(tokens.accessToken, tokens.refreshToken);
      if (user) {
        const code = this.generateCode(clientId, user.id);
        return res.redirect(`${isExistApplication.redirectUri}/${code}`);
      }
    }
    if (!email && !password) {
      throw new BadRequestException(
        'Вы не авторизованы. Email и Password обязательны для входа',
      );
    }
    const url = `${this.configService.getOrThrow<string>('RESOURCE_SERVER')}/auth/login`;
    const response = await axios.post(url, { email, password });

    if (!response.data) {
      throw new UnauthorizedException(
        'Введенные данные не верные, или сервер ресурсов не доступен',
      );
    }
    const code = await this.generateCode(clientId, response.data.userId);
    saveCookie(
      res,
      this.configService.getOrThrow<string>('COOKIE_NAME'),
      response.data.userId,
      this.configService,
    );
    return res.redirect(`${isExistApplication.redirectUri}/${code}`);
  }

  public async exchangeCodeForTokens(code: string) {
    const codeData = await this.prismaService.authorizationCode.findUnique({
      where: {
        code,
      },
    });

    if (!codeData) {
      throw new UnauthorizedException('Неверный код авторизации');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (
      currentTime >
      codeData.createdAt.getTime() / 1000 + codeData.expiresIn
    ) {
      throw new UnauthorizedException('Срок действия кода истек');
    }
    const scopesIds = await this.prismaService.applicationScopes.findMany({
      where: {
        applicationId: codeData.clientId,
      },
    });

    const scopes = [];

    for (const scope of scopesIds) {
      const scopeData = await this.prismaService.scopes.findUnique({
        where: {
          id: scope.scopeId,
        },
      });
      scopes.push(scopeData.name);
    }

    const accessTime = 60 * 60 * 1000;
    const refreshTime = 30 * 24 * 60 * 60 * 1000;

    const accessToken = this.jwtService.sign(
      { userId: codeData.userId, scopes },
      { expiresIn: accessTime },
    );
    const refreshToken = this.jwtService.sign(
      { userId: codeData.userId, scopes },
      { expiresIn: refreshTime },
    );

    await this.prismaService.authorizationCode.delete({
      where: { id: codeData.id },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  public async findUser(req: Request) {
    const tokens =
      req.cookies[this.configService.getOrThrow<string>('COOKIE_NAME')];

    const user = await this.getUser(tokens.accessToken, tokens.refreshToken);
    return user;
  }

  private async generateCode(clientId: string, userId: string) {
    const createdCode = await this.prismaService.authorizationCode.create({
      data: {
        code: v4(),
        expiresIn: convertTime('1h'),
        clientId,
        userId: userId,
      },
    });
    return createdCode.code;
  }

  private async getUser(accessToken: string, refreshToken: string) {
    const urlInfo = `${this.configService.getOrThrow<string>('RESOURCE_SERVER')}/user/info`;

    try {
      const response = await axios.get(urlInfo, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const newAccessToken = await this.refreshToken(refreshToken);
        if (newAccessToken) {
          return await this.getUser(newAccessToken, refreshToken);
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  private async refreshToken(refreshToken: string) {
    const urlRefresh = `${this.configService.getOrThrow<string>('RESOURCE_SERVER')}/auth/refresh`;
    try {
      const response = await axios.post(
        urlRefresh,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );
      return response.data.accessToken;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return null;
    }
  }
}
