import { IsDefined, IsEmail, IsString } from "class-validator";

export class UserRegisterDTO {
    @IsString()
    @IsDefined()
    name!: string;

    @IsString()
    @IsDefined()
    organizationName!: string;

    @IsString()
    @IsDefined()
    @IsEmail()
    email!: string;

    @IsString()
    @IsDefined()
    password!: string;
}
