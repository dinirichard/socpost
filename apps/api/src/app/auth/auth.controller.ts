import { Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { PassportLocalGaurd } from "../../shared/guards/passport-local.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    @UseGuards(PassportLocalGaurd)
    login(@Request() request) {
        return this.authService.signIn(request.user);
    }

    @Get("me")
    @UseGuards(PassportJwtAuthGuard)
    getUserInfo(@Request() request) {
        return request.user;
    }

    @HttpCode(HttpStatus.OK)
    @Post("register")
    @UseGuards(PassportLocalGaurd)
    register(@Request() request) {
        return this.authService.signIn(request.user);
    }
}
