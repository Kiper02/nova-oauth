import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 20)
    username: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    password: string;
}