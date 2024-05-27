import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private url : string = '/User'

  updatePassword(payload:any) : Observable<any>{
    return this.put(`${this.url}/${payload.userId}/UpdatePassword`, payload)
  }

  getUsers() : Observable<any> {
    return this.get(this.url);
  }

  getUserById(id:number) : Observable<any> {
    return this.get(`${this.url}/${id}`);
  }

  createUser(payload:any) : Observable<any> {
    return this.post(this.url, payload);
  }

  updateUser(userId:number, payload: any) : Observable<any> {
    return this.put(`${this.url}/${userId}`, payload);
  }
}
