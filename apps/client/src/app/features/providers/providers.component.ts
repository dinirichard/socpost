import { Component, computed, effect, inject, Input, OnInit, signal, viewChild } from "@angular/core";
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
import {MatMenuModule, MatMenuPanel, MatMenuTrigger} from '@angular/material/menu';

@Component({
    selector: "app-providers",
    standalone: true,
    imports: [
        CommonModule, MatDividerModule,
        MatSidenavModule, SchedulerComponent,
        MatListModule, MatIconModule,
        MatButtonModule, MatMenuModule
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

    menuTrigger = viewChild<MatMenuTrigger>('menuTrigger');
    menuOpened = signal(false);


    constructor() {
        this.providerStore.loadProviders();
    }

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

    openMenu() {
        console.log('Menu');
        this.menuTrigger().openMenu();
    }

    closeMenu() {
        this.menuTrigger().closeMenu();
    }

    disableProvider(providerId: string) {
        this.providerService.disableProvider(providerId, this.providerStore.orgId()).subscribe((result) => {
            this.providerStore.removeProvider(providerId);
            this.providerStore.addProvider(result);
          });
    }

    enableProvider(providerId: string) {
        this.providerService.enableProvider(providerId, this.providerStore.orgId()).subscribe((result) => {
            this.providerStore.removeProvider(providerId);
            this.providerStore.addProvider(result);
          });;
    }

    deleteProvider(providerId: string) {
        this.providerService.deleteProvider(providerId, this.providerStore.orgId()).subscribe((result) => {
            this.providerStore.removeProvider(providerId);
          });;
    }

}
