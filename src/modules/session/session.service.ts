import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/core/redis/redis.service';
import { getSessionMetaData } from 'src/shared/utils/session-metadata.util';
import { ISessionMetadata } from 'src/shared/types/session-metadata';

@Injectable()
export class SessionService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ) {}

    public async register(req: Request, dto: RegisterDto) {
        const isExist = await this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if(isExist) {
            throw new ConflictException('Пользователь с таким email уже существует')
        }


        const user = await this.prismaService.user.create({
            data: {
                ...dto,
                password: await hash(dto.password)
            }
        })
        const metadata = getSessionMetaData(req);
        return await this.saveSession(req, user, metadata);
    }


    public async login(req: Request, dto: LoginDto) {
        const isExist = await this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if(!isExist) {
            throw new BadRequestException('Пользователя с таким email не существует')
        }

        const isValidPassword = verify(isExist.password, dto.password);
        
        if(!isValidPassword) {
            throw new BadRequestException('Неверный пароль')
        }
        const metadata = getSessionMetaData(req);
        return await this.saveSession(req, isExist, metadata);
    }

    public async logout(req: Request) {
        return await this.destroySession(req);
    }

    public async findAllSessions(req: Request) {
        const userId = req.session.userId;
        const keys = await this.redisService.keys("*")
        
        const userSession = []
        
        for(const key of keys) {
            const sessionData = await this.redisService.get(key);
            if(sessionData) {
                const session = JSON.parse(sessionData)
                if(session.userId === userId) {
                    userSession.push({...session, id: key.split(":")[1]})
                }
            }
        }
        userSession.sort((a, b) => b.createdAt - a.createdAt);
        return userSession.filter(session => session.id != req.session.id);

    }

    public async findUser(req: Request) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: req.session.id
            }
        })
        return user;
    }


    private async saveSession(req: Request, user: User, metadata: ISessionMetadata) {
        req.session.userId = user.id;
        req.session.metadata = metadata;
        return new Promise((resolve, reject) => {
            req.session.save(err => {
                reject(new InternalServerErrorException('Не удалось сохранить сессию'))
            })
            resolve({user})
        })
    }

    private async destroySession(req: Request) {
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                reject(new InternalServerErrorException('Не удалось удалить сессию'))
            })
            req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
            resolve(true);
        })
    }


}
