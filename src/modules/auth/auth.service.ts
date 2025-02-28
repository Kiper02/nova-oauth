import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { v4 } from "uuid";
import { convertTime } from "src/shared/utils/convert-time";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}


    public async login(dto: LoginDto) {
        const {clientId, email, password} = dto;
    
        const isExistApplication = await this.prismaService.application.findUnique({
            where: {
                clientId
            }
        })

        if(!isExistApplication) {
            throw new NotFoundException("Приложение не найдено")
        }

        const url = `${this.configService.getOrThrow<string>("RESOURCE_SERVER")}/auth/login`;
        const response = await axios.post(url, {email, password});

        if(!response.data) {
            throw new UnauthorizedException("Введенные данные не верные, или сервер ресурсов не доступен");
        }
        const createdCode = await this.prismaService.authorizationCode.create({
            data: {
                code: v4(),
                expiresIn: convertTime("1h"),
                clientId,
                userId: response.data.userId
            }
        })

        return createdCode.code;

    }

    public async exchangeCodeForTokens(code: string) {
        const codeData = await this.prismaService.authorizationCode.findUnique({
            where: {
                code
            }
        })

        if(!codeData) {
            throw new UnauthorizedException("Неверный код авторизации");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > codeData.createdAt.getTime() / 1000 + codeData.expiresIn) {
            throw new UnauthorizedException("Срок действия кода истек");
        }
        const scopesIds = await this.prismaService.applicationScopes.findMany({
            where: {
                applicationId: codeData.clientId
            }
        })

        const scopes = [];

        for(const scope of scopesIds) {
            const scopeData = await this.prismaService.scopes.findUnique({
                where: {
                    id: scope.scopeId
                }
            })
            scopes.push(scopeData.name);
        }

        const accessTime = 60 * 60 * 1000;
        const refreshTime = 30 * 24 * 60 * 60 * 1000;

        const accessToken = this.jwtService.sign({userId: codeData.userId, scopes}, {expiresIn: accessTime});
        const refreshToken = this.jwtService.sign({userId: codeData.userId, scopes}, {expiresIn: refreshTime});


        await this.prismaService.authorizationCode.delete({where: {id: codeData.id}});

        return {
            accessToken,
            refreshToken
        }
    }
}
