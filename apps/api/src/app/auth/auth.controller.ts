import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { LoginDTO, UserRegisterDTO } from "./auth.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Body() body: LoginDTO) {
        Logger.log('/3000', body);
        const result = await this.authService.signIn(body);
        Logger.log('Login result', result);
        return result;
    }

    @Get("me")
    @UseGuards(PassportJwtAuthGuard)
    async getUserInfo(@Body() token: string) {
        return this.authService.authenticate(token);
    }

    @HttpCode(HttpStatus.OK)
    @Post("register")
    async register(@Body() body: UserRegisterDTO) {
        Logger.log('/3000', body);
        await this.authService.register(body);
        return;
    }
}
