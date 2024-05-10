import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private url : string = '/User'

  UpdatePassword(payload:any) : Observable<any>{
    return this.put(`${this.url}/${payload.userId}/UpdatePassword`, payload)
  }
}
