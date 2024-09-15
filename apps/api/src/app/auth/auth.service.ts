import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "../users/users.service";
import { UserRegisterDTO, AuthInput, AuthResult, SignInData, User, LoginDTO} from "./auth.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async authenticate(token: string): Promise<AuthResult> {
        const accessToken = await this.jwtService.verifyAsync(token);

        if (!accessToken) {
            throw new UnauthorizedException();
        }

        const tokenPayload = await this.jwtService.decode(token);
        const user = await this.usersService.findUserByEmail(tokenPayload.email);

        if (!user) {
            throw new UnauthorizedException();
        }

        return await this.validateUser(user);
    }

    async signIn(input: LoginDTO): Promise<AuthResult> {
        const user = await this.usersService.findUserByEmail(input.email);
        const isMatch = await bcrypt.compare(input.password, user.password);

        if (user && isMatch) {
            const authResult = await this.validateUser(user)
            return authResult;
        }
        throw new UnauthorizedException();
    }

    async validateUser(user: User): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(tokenPayload);

        return { accessToken, email: user.email, id: user.id } as AuthResult;
    }

    async register(userRegister: UserRegisterDTO): Promise<User> {
        const user = await this.usersService.createUser(userRegister);

        return user;
    }
}
