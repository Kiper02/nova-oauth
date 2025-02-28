import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Request } from 'express';
import { v4 } from 'uuid';
import { User } from '@prisma/client';
import * as moment from 'moment';
import 'moment/locale/ru';

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

        for(const scope of dto.scopes) {
            await this.prismaService.applicationScopes.create({
                data: {
                    scopeId: scope,
                    applicationId: created.id
                }
            })
        }

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
      
        const result = applications.map((item) => {
          return {
            ...item,
            createdAt: moment(item.createdAt).locale('ru').format('D MMMM YYYY'),
            updatedAt: moment(item.updatedAt).locale('ru').format('D MMMM YYYY'),
          };
        });
      
        return result;
      }
      

    public async findScopes() {
        const scopes = await this.prismaService.scopes.findMany();
        return scopes;
    }
}
