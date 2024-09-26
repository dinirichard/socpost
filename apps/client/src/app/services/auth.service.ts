import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { tap } from "rxjs/operators";
import { loginDTO, registerDTO } from "../models/auth.dto";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    httpClient = inject(HttpClient);
    baseUrl = "http://localhost:3000/api";

    // constructor() {

    // }

    signup(data: registerDTO) {
        return this.httpClient.post(`${this.baseUrl}/auth/register`, data);
    }

    login(data: loginDTO) {
        return this.httpClient.post(`${this.baseUrl}/auth/login`, data).pipe(
            tap((result: any) => {
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("orgId", result.orgId);
                localStorage.setItem("authUser", JSON.stringify(result));
            })
        );
    }

    logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("orgId");
        localStorage.removeItem("authUser");
    }

    isLoggedIn() {
        return localStorage.getItem("accessToken") !== null;
    }

    // encrypt(password: string): string {
    //   // return CryptoJS.AES.encrypt(password, this.key).toString();
    // }
}
