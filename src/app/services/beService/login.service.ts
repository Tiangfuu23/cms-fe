import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable } from 'rxjs';
import { StorageKeys } from '../../shared/constants/Constants.class';


@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService {
  private url = '/Login';

  login(payload : any): Observable<any> {
    return this.post(`${this.url}`, payload);
  }

  doLogin(account : any){
    localStorage.setItem(StorageKeys.TOKEN, account.token);
    localStorage.setItem(StorageKeys.USER_INFO, JSON.stringify(account.user));
  }
}
