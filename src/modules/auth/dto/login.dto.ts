import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class LoginDto {
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Length(8, 20)
    password?: string;

    @IsNotEmpty()
    @IsString()
    clientId: string;
}