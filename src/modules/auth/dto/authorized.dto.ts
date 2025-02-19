import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthorizedDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}