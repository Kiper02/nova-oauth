import { IsNotEmpty, IsString } from "class-validator";

export class RemoveSessionDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}