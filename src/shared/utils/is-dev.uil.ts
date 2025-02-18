import { ConfigService } from "@nestjs/config";

export function isDev(configService: ConfigService) {
    return configService.getOrThrow<string>("NODE_ENV") === 'development'
}

export const IS_DEV = process.env.NODE_ENV === 'development'