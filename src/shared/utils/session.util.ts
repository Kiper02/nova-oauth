import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { isDev } from "./is-dev.uil";

export const saveCookie = (res: Response, cookieName: string, data: any, configService: ConfigService) => {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + configService.getOrThrow<number>("COOKIE_EXPIRES_AT"))
    res.cookie(cookieName, {accessToken: data.accessToken, refreshToken: data.refreshToken}, {
        httpOnly: !isDev(configService),
        domain: !isDev(configService) ? configService.getOrThrow<string>("ALLOWED_ORIGIN") : undefined,
        secure: !isDev(configService),
        sameSite: isDev(configService) ? 'none' : 'lax',
        expires: expiresAt
    })
    return res;
}

export const clearCookie = (res: Response, cookieName: string) => {
    res.clearCookie(cookieName);
    return res;
}