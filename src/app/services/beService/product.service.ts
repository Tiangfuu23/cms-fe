import { Injectable } from "@angular/core";
import { BaseService } from "../../shared/services/base.service";
import { Observable } from "rxjs";

@Injectable({
  'providedIn': 'root'
})
export class ProductService extends BaseService{
  private url : string = '/product';

  getProducts() : Observable<any>{
    return this.get(this.url);
  }

  getProductById(id:number) : Observable<any> {
    return this.get(`${this.url}/${id}`);
  }

  createProduct(payload : any) : Observable<any> {
    return this.post(this.url, payload);
  }

  updateProduct(productId: number, payload : any) : Observable<any> {
    return this.put(`${this.url}/${productId}`, payload);
  }

  deleteProduct(productId: number) : Observable<any> {
    return this.delete(`${this.url}/${productId}`);
  }
}
