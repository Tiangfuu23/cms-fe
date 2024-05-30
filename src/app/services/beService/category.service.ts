import { Injectable } from "@angular/core";
import { BaseService } from "../../shared/services/base.service";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService{
  private url = '/Category'

  getCategories() : Observable<any> {
    return this.get(this.url);
  }

  getCategoryById(categoryId : number) : Observable<any> {
    return this.get(`${this.url}/${categoryId}`);
  }

  createCategory(payload : any) : Observable<any> {
    return this.post(this.url, payload);
  }

  updateCategory(categoryId:number, payload : any) : Observable<any> {
    return this.put(`${this.url}/${categoryId}`, payload);
  }

  deleteCategory(categoryId:number) : Observable<any> {
    return this.delete(`${this.url}/${categoryId}`);
  }

  getProductsByCategoryId(categoryId:number) : Observable<any> {
    return this.get(`${this.url}/${categoryId}/Product`)
  }

  checkToken() : Observable<any> {
    return this.get(`${this.url}/Checktoken`);
  }
}
