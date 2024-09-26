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

export class LoginDTO {
    @IsString()
    @IsDefined()
    @IsEmail()
    email!: string;

    @IsString()
    @IsDefined()
    password!: string;
}

export type AuthInput = { email: string; password: string };
export type SignInData = { id: string; email: string };
export type AuthResult = { accessToken: string; id: string; email: string; orgId: string};
export interface User {
    id: string;
    email: string;
    password: string;
    orgId: string;
};
