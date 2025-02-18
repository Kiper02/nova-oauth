import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    password: string;
}