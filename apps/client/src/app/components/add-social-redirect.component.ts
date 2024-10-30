import { afterRender, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProvidersService } from "../services/providers.service";
import { ProvidersStore } from "../core/signal-states/providers.state";

@Component({
    selector: "app-add-social-redirect",
    standalone: true,
    imports: [CommonModule],
    template: `<div class="mt-14 pt-6">
                    <h1 class="has-text-weight-bold has-text-centered is-size-1">Adding channel, Redirecting You</h1>
                </div>`,
    styles: ``,
    providers: [ProvidersStore],
})
export class AddSocialRedirectComponent implements OnInit {
    readonly providerStore = inject(ProvidersStore);
    provider: string | null = null;
    code: string | null = null;
    state: string | null = null;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private providerService: ProvidersService,
      ) {  }
      
    ngOnInit() {

        this.route.params.subscribe((params: any) => {
            console.log(params, 'Params');
            if (params.provider) {
                this.provider = params.provider;
            }    
        });

        // Data:  { title: 'Company' } 
        this.route.queryParamMap.subscribe(queryParamMap => {
            console.log(queryParamMap, 'queryParamMap');
            // For YouTube
            if (queryParamMap.has('state') && queryParamMap.has('code')) {
                this.code = queryParamMap.get('code');
                this.state = queryParamMap.get('state');
            }
            // For X
            if (queryParamMap.has('oauth_token') && queryParamMap.has('oauth_verifier')) {
                this.code = queryParamMap.get('oauth_verifier');
                this.state = queryParamMap.get('oauth_token');
            }
        });
        
        if ( this.code && this.state && this.provider ) {
            console.log(this.code, 'code');
            console.log(this.state, 'state');
            this.providerService.connectToSocial(this.provider, this.code, this.state)
            .subscribe( {
                next: (res) => {
                  this.providerStore.addProvider(res);
                  this.router.navigate(['/scheduler']);
                },
                error: (err) => {
                  console.log(err);
                }
              });
        }
    }
}
