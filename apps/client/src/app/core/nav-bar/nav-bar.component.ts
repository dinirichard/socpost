import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";

import { animate, scroll } from "motion";
import { AuthService } from "../../services/auth.service";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-navbar",
    standalone: true,
    imports: [
        RouterLink, RouterOutlet, 
        RouterLinkActive, MatToolbarModule, 
        MatIconModule, MatButtonModule
    ],
    templateUrl: "./nav-bar.component.html",
    styleUrl: "./nav-bar.component.scss",
    // host: {
    //     "(mouseenter)": "hover.set(true)",
    //     "(mouseleave)": "hover.set(false)",
    // },
})
export class NavBarComponent {
    // navbarVisible = signal(true);
    // hover = signal(false);
    // navbar = viewChild.required<ElementRef>("navbar");

    darkMode = signal(true);

    setDarkMode = effect(() => {
        document.documentElement.classList.toggle('dark', this.darkMode());
    });

    authService = inject(AuthService);
    router = inject(Router);
    public logout() {
        this.authService.logout();
        this.router.navigate(["login"]);
    }
    // ngOnInit() {
    // scroll((scrollInfo) => {
    //     const position = scrollInfo.y.current;
    //     const velocity = scrollInfo.y.velocity;
    //     if (Math.abs(velocity) > 50) {
    //         position < 550 || velocity < 0
    //             ? this.navbarVisible.set(true)
    //             : this.navbarVisible.set(false);
    //     }
    // });
    // }
    // logVisible = effect(() => console.log(this.navbarVisible()));
    // animateNav = effect(() => {
    //     this.navbarVisible() || this.hover()
    //         ? animate(this.navbar().nativeElement, { y: "0%" }, { duration: 0.2 })
    //         : animate(this.navbar().nativeElement, { y: "-70%" }, { duration: 0.2 });
    // });
}
