import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class UpdateDto {
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsString()
    @Length(8, 30)
    password: string;

    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsOptional()
    @IsString()
    displayName: string;
}