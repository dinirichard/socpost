import { Component, effect, ElementRef, OnInit, signal, viewChild } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { animate, scroll } from "motion";

@Component({
    selector: "app-navbar",
    standalone: true,
    imports: [RouterLink, RouterOutlet, RouterLinkActive],
    templateUrl: "./nav-bar.component.html",
    styleUrl: "./nav-bar.component.scss",
    host: {
        "(mouseenter)": "hover.set(true)",
        "(mouseleave)": "hover.set(false)",
    },
})
export class NavBarComponent {
    // navbarVisible = signal(true);
    // hover = signal(false);
    // navbar = viewChild.required<ElementRef>("navbar");
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
