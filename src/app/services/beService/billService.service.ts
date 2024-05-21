import { Injectable } from "@angular/core";
import { BaseService } from "../../shared/services/base.service";
import { Observable } from "rxjs";

@Injectable({
  'providedIn': 'root'
})
export class BillService extends BaseService{
  private url : string = '/Bill';

  getBills() : Observable<any> {
    return this.get(this.url);
  }

  createBill(payload : any) : Observable<any> {
    return this.post(this.url, payload);
  }

  deleteBill(id : number) : Observable<any> {
    return this.delete(`${this.url}/${id}`);
  }
}
