import { Component, effect, ElementRef, signal, viewChild, viewChildren } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    FormControl,
    Validators,
    FormsModule,
    ReactiveFormsModule,
    FormGroup,
} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CustomValidators } from "./auth.validator";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { explicitEffect } from "ngxtension/explicit-effect";
import { animate } from "motion";

@Component({
    selector: "app-auth",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: "./auth.component.html",
    styleUrl: "./auth.component.scss",
})
export class AuthComponent {
    switchForm = signal(false);
    authList = viewChild.required<ElementRef>("ul");
    authViews = viewChildren<ElementRef>("view");
    hidePassword = true;
    hideRegisterPassword = true;
    hideRegisterConfirmationPassword = true;

    loginForm = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6)]),
    });

    registerForm = new FormGroup(
        {
            name: new FormControl("", Validators.required),
            email: new FormControl("", [Validators.required, Validators.email]),
            password: new FormControl("", [Validators.required, Validators.minLength(6)]),
            confirmPassword: new FormControl("", [Validators.required, Validators.email]),
            organizationName: new FormControl("", Validators.required),
        },
        [CustomValidators.MatchValidator("password", "confirmPassword")]
    );

    get passwordMatchError() {
        return (
            this.registerForm.getError("mismatch") &&
            this.registerForm.getError("confirmPassword")?.touched
        );
    }

    animateFormSwitch = explicitEffect([this.switchForm], ([switchForm]) => {
        switchForm
            ? animate(this.authList().nativeElement, { x: "0%" }, { duration: 0.8 })
            : animate(this.authList().nativeElement, { x: "-100%" }, { duration: 0.8 });
    });

    onLogin() {
        // this.switchForm.set(false);
    }

    onRegister() {
        // dfd
    }

    public hideEvent(event: MouseEvent, hide: string) {
        if (hide === "hidePassword") {
            this.hidePassword = !this.hidePassword;
        }
        if (hide === "hideRegisterPassword") {
            this.hideRegisterPassword = !this.hideRegisterPassword;
        }
        if (hide === "hideRegisterConfirmationPassword") {
            this.hideRegisterConfirmationPassword = !this.hideRegisterConfirmationPassword;
        }
    }
}
