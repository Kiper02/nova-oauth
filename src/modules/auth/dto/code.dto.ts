import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";

export class CodeDto {
    @IsNotEmpty()
    @IsString()
    code: string;
}