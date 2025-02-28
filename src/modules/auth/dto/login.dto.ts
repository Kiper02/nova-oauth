import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 20)
    password: string;

    @IsNotEmpty()
    @IsString()
    clientId: string;
}