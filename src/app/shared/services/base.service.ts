import { Injectable } from '@angular/core';
import { IAppConfig } from '../../models/app-config';
import { StorageKeys } from '../constants/Constants.class';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigStateService } from '../app-state/config-state.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = '';

  constructor(
    private configState: ConfigStateService,
    private httpClient: HttpClient,
  ) {
    this.configState.subscribe( (data: IAppConfig) => {
      this.baseUrl = data.beUrl
      // console.log(`base url ${this.baseUrl}`)
    });
  }

  protected get(url: string, params?: {}, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.get(this.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'text',
        });
      case 'blob':
        return this.httpClient.get(this.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'blob',
        });
      default:
        return this.httpClient.get(this.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params
        });
    }
  }

  protected post(url: string, data: any, params?: {}, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.post(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'text',
          params
        });
      case 'blob':
        return this.httpClient.post(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      case 'arraybuffer':
        return this.httpClient.post(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      default:
        return this.httpClient.post(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          params
        });
    }
  }

  protected put(url: string, data: any, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.put(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
         responseType: 'text'
        });
      default:
        return this.httpClient.put(this.baseUrl + url, data, {
          headers: this.createHeaders() || {},
        });
    }
  }

  protected delete(url: string, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.delete(this.baseUrl + url, {
          headers: this.createHeaders() || {},
          responseType: 'text'
        });
      default:
        return this.httpClient.delete(this.baseUrl + url, {
          headers: this.createHeaders() || {},
        });
    }
  }

  private createHeaders() {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem(StorageKeys.TOKEN));
    return headers;
  }
}
