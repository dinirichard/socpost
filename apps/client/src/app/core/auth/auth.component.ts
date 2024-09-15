import {
    Component,
    effect,
    ElementRef,
    inject,
    signal,
    viewChild,
    viewChildren,
} from "@angular/core";
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
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";

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
        RouterModule,
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

    authService = inject(AuthService);
    router = inject(Router);

    protected loginForm = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6)]),
    });

    public registerForm = new FormGroup(
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
            ? animate(this.authList().nativeElement, { x: "0%" }, { duration: 1 })
            : animate(this.authList().nativeElement, { x: "-100%" }, { duration: 1 });
    });

    protected onLogin() {
        if (this.loginForm.valid) {
            console.log(this.loginForm.value);
            this.authService.login(this.loginForm.value).subscribe((data: any) => {
                if (this.authService.isLoggedIn()) {
                    this.router.navigate(["/admin"]);
                }
                console.log(data);
            });
        }
    }

    protected onRegister() {
        if (this.registerForm.valid) {
            console.log(this.registerForm.value);
            this.authService.signup(this.registerForm.value).subscribe({
                next: (data: any) => {
                    console.log(data);
                    this.router.navigate(["/login"]);
                },
                error: (err) => console.log(err),
            });
        }
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
