import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as urljoin from 'url-join';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RafflesService {

  constructor(
    private httpClient: HttpClient
  ) { }

  post = {
    mercadopago: {
      pay: (name, email, DNI, phone, endpoint, participations) => {
        const URL = urljoin(environment.apiURL, 'MP/pay', endpoint);
        const BODY = {
          name,
          email,
          identification: {
            type: 'DNI',
            number: DNI.toString()
          },
          phone: { number: Number(phone) },
          participations
        };
        return this.httpClient.post<any>(URL, BODY);
      }
    },
  };
  get = {
    raffles: () => {
      const URL = urljoin(environment.apiURL, 'active_raffles');
      return this.httpClient.get<any>(URL);
    },
    participationsByDNI: (DNI) => {
      const URL = urljoin(environment.apiURL, 'participations', DNI.toString());
      return this.httpClient.get<any>(URL);
    }
  };
}
