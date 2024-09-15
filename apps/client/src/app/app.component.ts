import { Component } from "@angular/core";
import { RouterLink, RouterModule } from "@angular/router";
import { NavBarComponent } from "./core/nav-bar/nav-bar.component";

@Component({
    standalone: true,
    imports: [RouterModule, NavBarComponent, RouterLink],
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {
    title = "SocPost";
}
