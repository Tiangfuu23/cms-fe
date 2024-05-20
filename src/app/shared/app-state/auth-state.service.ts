import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { IAuthModel, INIT_AUTH_MODEL } from "../../models/authModel";
import { StorageKeys } from "../constants/Constants.class";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private subject: BehaviorSubject<IAuthModel>;
  private authData: IAuthModel;
  constructor() {
    let localAuthData = localStorage.getItem(StorageKeys.USER_INFO)
    if(localAuthData){
      this.authData = JSON.parse(localAuthData)
    }else{
      this.authData = JSON.parse(JSON.stringify(INIT_AUTH_MODEL));
    }
    this.subject = new BehaviorSubject<IAuthModel>(this.authData);
  }
  public getAuthData(): Observable<IAuthModel> {
    return this.subject.asObservable();
  }
  public dispatch(payload: any | null): void {
    const data: Partial<IAuthModel> = payload as Partial<IAuthModel>;
    this.authData = {...this.authData, ...data};

    const dispatchedModel: IAuthModel = JSON.parse(JSON.stringify(this.authData));
    localStorage.setItem(StorageKeys.USER_INFO, JSON.stringify(dispatchedModel));
    this.subject.next(dispatchedModel);
  }
}
