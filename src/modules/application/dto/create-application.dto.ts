import { IsArray, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 30)
    name: string;

    @IsNotEmpty()
    @IsString()
    // @IsUrl()
    redirect_uri: string;

    @IsNotEmpty()
    @IsArray()
    scopes: string[];

    @IsNotEmpty()
    @IsString()
    // @IsUrl()
    host: string;
}