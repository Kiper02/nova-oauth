import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetAuthorizationUrlDto } from './dto/get-authorization-url.dto';
import { v4 } from 'uuid';
import { AuthorizedDto } from './dto/authorized.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { convertTime } from 'src/shared/utils/convert-time';
import { Request } from 'express';

@Injectable()
export class AuthService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    public async getAuthorizationCode(dto: GetAuthorizationUrlDto) {
        const application = await this.prismaService.application.findFirst({
            where: {
                clientId: dto.clientId,
                clientSecret: dto.clientSecret
            }
        })

        if (!application) {
            throw new UnauthorizedException('Неверный clientId или clientSecret');
        }

        
        let authorizationCode: string;
        let isUnique = false;

        while (!isUnique) {
            authorizationCode = v4();
            try {
                await this.prismaService.authorizationCode.create({
                    data: {
                        code: authorizationCode,
                        applicationId: application.id,
                        expiresIn: 60 * 60 * 1000
                    }
                });
                isUnique = true;
            } catch (error) {
                if (error.code === 'P2002') { 
                    console.warn('Сгенерирован неуникальный код, генерируем новый...');
                } else {
                    console.error('Ошибка при создании authorizationCode:', error);
                    throw new Error('Не удалось создать authorizationCode');
                }
            }
        }
        return authorizationCode;
    }

    public async authorized(dto: AuthorizedDto) {
        const isAuth = await this.prismaService.authorizationCode.findUnique({
            where: {
                code: dto.code
            }
        })

        if(!isAuth) {
            throw new UnauthorizedException("Неверный код")
        }

        const application = await this.prismaService.application.findFirst({
            where: {
                id: isAuth.applicationId
            }
        })

        if(!application) {
            throw new NotFoundException("Приложение не найдено")
        }

        const accountServer = this.configService.getOrThrow<string>("ACCOUNT_API_SERVER");
        let user;
        try {
            user = await axios.post(`${accountServer}/auth/login`, {
                email: dto.email,
                password: dto.password,
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
    
        } catch (error) {
            throw new BadRequestException(error.message)         
        }
        await this.prismaService.account.create({
            data: {
                userId: user.data.id,
                applicationId: application.id,
                accessToken: user.data.accessToken,
                refreshToken: user.data.refreshToken,
            }
        })

        if(!user) {
            throw new BadRequestException("Не удалось выполнить запрос для авторизации. Пожалуйста, убедитесь, что вы ввели правильные данные")
        }
        const accessTime = convertTime(this.configService.getOrThrow<string>("ACCESS_EXPIRES_IN"));
        const refreshTime = convertTime(this.configService.getOrThrow<string>("REFRESH_EXPIRES_IN"));
        const accessToken = this.jwtService.sign({userId: user.data.id, applicationId: application.id}, {expiresIn: accessTime})
        const refreshToken = this.jwtService.sign({userId: user.data.id, applicationId: application.id}, {expiresIn: refreshTime})
        
        const tokenData = await this.prismaService.accessToken.create({
            data: {
                token: accessToken,
                expiresIn: accessTime,
                applicationId: application.id,
                userId: application.userId
            }
        })

        const refreshData = await this.prismaService.refreshToken.create({
            data: {
                token: refreshToken,
                expiresIn: refreshTime,
                accessTokenId: tokenData.id
            }
        })

        await this.prismaService.authorizationCode.delete({
            where: {
                code: dto.code
            }
        });

        return {
            accessToken: tokenData.token,
            refreshToken: refreshData.token
        }
    }

    public async refresh(req: Request) {
        const token = req.headers["authorization"];

        if(!token) {
            throw new UnauthorizedException("Клиент не авторизован");
        }

        const isVerify = this.jwtService.verify(token);
        if(!isVerify) {
            throw new UnauthorizedException("Клиент не авторизован");
        }

        const isExistRefresh = await this.prismaService.refreshToken.findUnique({
            where: {
                token
            }
        }) 

        if(!isExistRefresh) {
            throw new UnauthorizedException("Клиент не авторизован");
        }

        const accessTokenData = await this.prismaService.accessToken.findUnique({
            where: {
                id: isExistRefresh.accessTokenId
            },
            include: {
                application: true
            }
        })


        const accessTime = convertTime(this.configService.getOrThrow<string>("ACCESS_EXPIRES_IN"));
        const refreshTime = convertTime(this.configService.getOrThrow<string>("REFRESH_EXPIRES_IN"));
        const accessToken = this.jwtService.sign({userId: accessTokenData.application.userId, applicationId: accessTokenData.applicationId}, {expiresIn: accessTime})
        const refreshToken = this.jwtService.sign({userId: accessTokenData.application.userId, applicationId: accessTokenData.applicationId}, {expiresIn: refreshTime})
        const tokenData = await this.prismaService.accessToken.create({
            data: {
                token: accessToken,
                expiresIn: accessTime,
                applicationId: accessTokenData.application.id,
                userId: accessTokenData.application.userId
            }
        })

        const refreshData = await this.prismaService.refreshToken.create({
            data: {
                token: refreshToken,
                expiresIn: refreshTime,
                accessTokenId: tokenData.id
            }
        })

        return {
            accessToken: tokenData,
            refreshToken: refreshData
        }
    }
}
