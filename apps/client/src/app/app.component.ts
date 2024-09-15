import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from "./core/nav-bar/nav-bar.component";

@Component({
  standalone: true,
  imports: [NavBarComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'SocPost';
}
