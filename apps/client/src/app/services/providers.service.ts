import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, inject, Injectable } from '@angular/core';
import { makeId } from '@socpost/libraries/nest/lib/services/make.is';
import { ProviderItem } from '../models/provider.dto';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  httpClient = inject(HttpClient);
  baseUrl = "http://localhost:3000/api/integrations";
  localStorage: Storage | undefined;
  orgId = '';

  constructor(@Inject(DOCUMENT) private docu: Document) {
      this.localStorage = this.docu.defaultView?.localStorage;
      if ( localStorage.getItem('orgId') ) {
        this.orgId = String(localStorage.getItem('orgId'));
      }
  }

  getAllProviders(): Observable<ProviderItem[]> {
    console.log(this.orgId, 'this.orgId');
    const params = new HttpParams()
      .set('orgId', this.orgId);
    return this.httpClient.get<ProviderItem[]>( this.baseUrl + '/list', { params: {
      ['orgId']: this.orgId,
    } } );
  }

  connectToSocial(provider: string): Observable<ProviderItem> {
    console.log(provider, 'connectToSocial provider');
    const integrationAuthDetails = this.getIntegrationUrl(provider);
    // if (integrationAuthDetails) {
    console.log(integrationAuthDetails, 'integrationAuthDetails');
    return  this.httpClient.post<ProviderItem>(`${this.baseUrl}/social/${provider}/connect`, {
                code: integrationAuthDetails.code,
                state: integrationAuthDetails.state,
                orgId: this.localStorage ? this.localStorage.getItem("accessToken") : undefined,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                refresh: undefined,
            });
  }

  getIntegrationUrl(provider: string) {
    let responseData: any;
    const params = new HttpParams()
      .set('integration', provider);
    this.httpClient.post(`${this.baseUrl}/social/${provider}`, { params: {
      ['integration']: provider,
    } }).subscribe( {
      next: (data: any) => {
          console.log(data);
          responseData = data;
      },
      error: (err) => {
        console.log(err); 
      }
    });
    return responseData;
  }

}
