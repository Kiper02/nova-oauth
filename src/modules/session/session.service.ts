import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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
import saveFile from 'src/shared/utils/save-file';

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
        await this.redisService.del(req.session.id)
        await this.destroySession(req);        
        return true
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
        return userSession.filter(session => session.id !== req.session.id);

    }

    public async findProfile(user: User) {
        const profile = await this.prismaService.user.findUnique({
            where: {
                id: user.id
            }
        })

        if(profile && profile.avatar) {
            profile.avatar = profile.avatar ? `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/${profile.avatar}` : null;
        } 
        return profile;
    }

    public async uploadAvatar(user: User, avatar: Express.Multer.File) {
        if(!avatar) {
            throw new BadRequestException('Поле avatar обязательно');
        }

        const nameAvatar = saveFile(avatar);


        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                avatar: nameAvatar
            }
        })

        return true;
    }

    public async removeSession(req: Request, id: string) {
        const userId = req.session.userId;
        const key = await this.redisService.get(id);
        
        if(!key) {
            throw new BadRequestException('Сессия не найдена')
        }
        const session = JSON.parse(key)
        
        if(session.userId !== userId) {
            throw new UnauthorizedException('Вы не можете удалить эту сессию')
        }

        await this.redisService.del(key);
        await this.destroySession(req);        
        return true
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
