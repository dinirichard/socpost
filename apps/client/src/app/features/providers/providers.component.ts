import { Component, computed, effect, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {MatSidenavModule} from '@angular/material/sidenav';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { ProvidersService } from "../../services/providers.service";
import { Provider } from "../../models/provider.dto";
import { MatDialog } from "@angular/material/dialog";
import { SelectSocialDialogComponent } from "../../components/select-social/select-social.component";
import { Dialog } from "@angular/cdk/dialog";
import { ProvidersStore } from "../../core/signal-states/providers.state";

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
    providers: [ProvidersStore],
})
export class ProvidersComponent {
    providerService = inject(ProvidersService);
    readonly providerStore = inject(ProvidersStore);
    readonly dialog = inject(MatDialog);
    orgId: string | null = null;

    sideNavWidth = '250px';
    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
    });
    providerImgSize = computed(() => this.sideNavCollapsed() ? '32px' : '50px')
    providers: Provider[] = [];

    selectedProvider = signal('');


    constructor() {
        this.providerStore.loadProviders();
        // this.providerStore.writeToStorage();
    }

    // sdss = effect( () => {
    //     console.log(this.sideNavWidth);
    //     console.log(this.sideNavCollapsed());
    // });

    changeSideNav(val: string) {
        this.sideNavWidth = val;
    }

    async addProvider() {
        const dialogRef = this.dialog.open(SelectSocialDialogComponent, {
            data: {
              social: this.selectedProvider(),
              title: 'Add'
            },
        });
      
        await dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.selectedProvider.set(result.social);
              this.connectToSocial(this.selectedProvider());
            }
        });
    }

    connectToSocial(provider: string) {
        this.providerService.getIntegrationUrl(provider);
    }

}
