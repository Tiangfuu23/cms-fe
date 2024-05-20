import { Injectable } from "@angular/core";
import { BaseService } from "../../shared/services/base.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {
  private url = "/dashboard";

  getDashboardIn4() : Observable<any> {
    return this.get(this.url);
  }
}
