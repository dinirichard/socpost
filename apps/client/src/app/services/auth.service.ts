import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { tap } from "rxjs/operators";
import { loginDTO, registerDTO } from "../models/auth.dto";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    httpClient = inject(HttpClient);
    baseUrl = "http://localhost:3000/api";
    localStorage: Storage | undefined;

    constructor(@Inject(DOCUMENT) private docu: Document) {
        this.localStorage = this.docu.defaultView?.localStorage;
    }

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
        if (this.localStorage)
            return this.localStorage.getItem("accessToken") !== null;
        return null;
    }

    // encrypt(password: string): string {
    //   // return CryptoJS.AES.encrypt(password, this.key).toString();
    // }
}
