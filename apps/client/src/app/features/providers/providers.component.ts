import { Component, computed, effect, Input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {MatSidenavModule} from '@angular/material/sidenav';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

export type ProviderItem = {
    picture: string;
    name: string;
    id: string;
    label: string;
}

@Component({
    selector: "app-providers",
    standalone: true,
    imports: [
        CommonModule, 
        MatDividerModule,
        MatSidenavModule, 
        SchedulerComponent,
        MatListModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: "./providers.component.html",
    styleUrl: "./providers.component.scss",
})
export class ProvidersComponent {
    sideNavWidth = '250px';

    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
});

    providerImgSize = computed(() => this.sideNavCollapsed() ? '32px' : '50px')

    menuItems = signal<ProviderItem[]>([
        {
            picture: 'LinkedIn.png',
            name: 'LinkedIn',
            id: 'adfvfnmmyun',
            label: 'linkedIn'
        },
        {
            picture: 'YouTube.png',
            name: 'YouTube',
            id: 'adfvfsdsddnmmyun',
            label: 'youtube'
        },
        {
            picture: 'TwitterX.png',
            name: 'X',
            id: 'dsdsddd',
            label: 'twitterX'
        },
        {
            picture: 'Instagram.png',
            name: 'Instagram',
            id: 'adfvfnmlkkdllmyun',
            label: 'instagram'
        },
    ]);

    sdss = effect( () => {
        console.log(this.sideNavWidth);
        console.log(this.sideNavCollapsed());
      });

      changeSideNav(val: string) {
        this.sideNavWidth = val;
      }

}
