import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgetPasswordService extends BaseService {
  private url = '/ForgetPassword';

  forgetPassword(payload: any) : Observable<any> {
    return this.post(this.url, payload);
  }

  authenticateOtpCode(payload: any) : Observable<any> {
    return this.post(`${this.url}/OtpCode`, payload);
  }
}
