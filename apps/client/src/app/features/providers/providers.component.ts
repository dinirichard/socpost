import { Component, computed, effect, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {MatSidenavModule} from '@angular/material/sidenav';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { ProvidersService } from "../../services/providers.service";
import { ProviderItem } from "../../models/provider.dto";
import { MatDialog } from "@angular/material/dialog";
import { SelectSocialDialogComponent } from "../../components/select-social/select-social.component";

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
export class ProvidersComponent implements OnInit {
    providerService = inject(ProvidersService);
    readonly dialog = inject(MatDialog);

    sideNavWidth = '250px';
    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
    });
    providerImgSize = computed(() => this.sideNavCollapsed() ? '32px' : '50px')
    providers: ProviderItem[] = [];

    selectedProvider = signal('');

    ngOnInit(): void {
        this.providerService.getAllProviders().subscribe( res => {
            this.providers = res;
            console.log(res, 'Providers List');
        });
    }

    sdss = effect( () => {
        console.log(this.sideNavWidth);
        console.log(this.sideNavCollapsed());
    });

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
              console.log(`Dialog result: ${result.social}`);
              this.selectedProvider.set(result.social);
              this.connectToSocial(this.selectedProvider());
            }
          });
    }

    connectToSocial(provider: string) {
        this.providerService.connectToSocial(provider).subscribe( result => {
          this.providers.push(result);
        });
    }

}
