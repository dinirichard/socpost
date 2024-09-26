// import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy } from "passport-local";
// import { AuthService } from "../../app/auth/auth.service";


// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
//     constructor(private authService: AuthService) {
//         super({
//             usernameField: 'email',
//             passwordField: 'password'
//         });
//     }
    
//     async validate(email: string, password: string) {
//         Logger.log('email', email);
//         Logger.log('password', password);
//         const user = await this.authService.signIn({
//             email,
//             password
//         });

//         if(!user) {
//             Logger.log('password', password);
//             throw new UnauthorizedException();
//         }
//         return user;
//     }

// }