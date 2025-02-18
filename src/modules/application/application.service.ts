import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Request } from 'express';
import { v4 } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class ApplicationService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    public async create(user: User, dto: CreateApplicationDto) { 
        const clientId = v4();
        const clientSecret = v4();

        const created = await this.prismaService.application.create({
            data: {
                name: dto.name,
                redirectUri: dto.redirect_uri,
                clientSecret,
                clientId,
                userId: user.id,
            }
        })

        return created;
    }

    public async findById(id: string) {
        const application = await this.prismaService.application.findUnique({
            where: {
                id
            }
        })

        return application;
    }

    public async findAll(user: User) {
        const applications = await this.prismaService.application.findMany({
            where: {
                userId: user.id
            }
        })

        return applications;
    }
}
