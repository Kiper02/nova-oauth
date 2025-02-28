import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateScopeDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 40)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Length(3, 40)
    description: string;
}