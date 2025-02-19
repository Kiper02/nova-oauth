import { IsNotEmpty, IsString } from "class-validator";

export class GetAuthorizationUrlDto {
    @IsNotEmpty()
    @IsString()
    clientId: string;
    
    @IsNotEmpty()
    @IsString()
    clientSecret: string;
}