import { HttpClient, HttpParams } from '@angular/common/http';
import { afterRender, Inject, inject, Injectable } from '@angular/core';
import { Provider } from '../models/provider.dto';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ProvidersStore } from '../core/signal-states/providers.state';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
    httpClient = inject(HttpClient);
    // readonly store = inject(ProvidersStore);
    // storage = inject(BrowserStorageServerService);
    baseUrl = "http://localhost:3000/api/integrations";
    orgId: string | null = null;

    constructor(private router: Router, 
      // private providerStore: ProvidersStore
    ) {

    }

    getAllProviders(orgId: string): Observable<Provider[]> {
        // console.log(this.orgId, 'this.orgId');
        const org = orgId === '' ? localStorage.getItem('orgId') : orgId;

        return this.httpClient.get<Provider[]>( this.baseUrl + '/list', { 
          params: {
              ['orgId']: org ? org : '',
          } 
        });
    }

    connectToSocial(provider: string, code: string, state: string): Observable<Provider> {
      const date = new Date();
      const timezoneOffset = date.getTimezoneOffset();
        console.log(`provider: ${provider}\n
          state: ${state} \n
          code: ${code} \n
          Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone} \n
          orgID: ${this.orgId}\n`, 'Connect body');

        return this.httpClient.post<Provider>(`${this.baseUrl}/social/${provider}/connect`, {
                    code: code,
                    state: state,
                    orgId: localStorage ? localStorage.getItem('orgId') : '',
                    timezone: timezoneOffset.toString(),
                    refresh: undefined,
                });
    }

    getIntegrationUrl(provider: string) {
        let responseData: any;
        this.httpClient.get(`${this.baseUrl}/social/${provider}`).subscribe( {
            next: (data: any) => {
                console.log(data);
                responseData = data;
                window.location.href = responseData.url;
            },
            error: (err) => {
              console.log(err); 
            }
        });



        return responseData;
    }

    disableProvider(providerId: string, orgId: string): Observable<Provider>  {
      console.log('providerId: ', providerId);
      console.log('orgId: ', orgId);
        return this.httpClient.post<Provider>(this.baseUrl + '/disable', {
            id: providerId,
            orgId,
        });
    }

    enableProvider(providerId: string, orgId: string): Observable<Provider>  {
      return this.httpClient.post<Provider>(this.baseUrl + '/enable',{
          id: providerId,
          orgId,
        });
    }

    deleteProvider(providerId: string, orgId: string) {
        return this.httpClient.delete(this.baseUrl+'/', {
          body: {
            id: providerId,
            orgId,
          }
        });
    }

}
