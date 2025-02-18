import { Request } from "express";
import { IS_DEV } from "./is-dev.uil";
import { UAParser } from "ua-parser-js";
import { ISessionMetadata } from "../types/session-metadata";
import * as geoip from 'geoip-lite'

export function getSessionMetaData(req: Request): ISessionMetadata {
    const ip =  IS_DEV ? "207.97.227.239" : req?.ip 
    const userAgent = req.headers['user-agent'];

    const geo = geoip.lookup(ip)

    const parser = new UAParser(userAgent);

    return {
        ip,
        browser: parser.getBrowser()?.name || 'Неизвестный браузер',
        os: parser.getOS()?.name || 'Неизвестная ОС',
        device: parser.getDevice()?.model || 'Неизвестное устройство',
        country: geo.country || "Неизвестная страна",
        region: geo.region || "Неизвестный регион",
        timezone: geo.timezone || "Неизвестная временная зона",
        city: geo.city || "Неизвестный город",
    }
} 