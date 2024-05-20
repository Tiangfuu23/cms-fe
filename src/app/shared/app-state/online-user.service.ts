import { Injectable } from "@angular/core";
import { IAuthModel } from "../../models/authModel";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OnlineUserService {
  private mapUserId2UserModel;
  private subject : BehaviorSubject<Map<number, IAuthModel>>;

  constructor() {
    this.mapUserId2UserModel = new Map()
    this.subject = new BehaviorSubject(this.mapUserId2UserModel);
  }

  subscribe(callback : (map : Map<number, IAuthModel>) => void) {
    this.subject.subscribe(callback);
  }

  update(payload: any | null) : void {
    this.mapUserId2UserModel.clear();
    // console.log(Object.values(payload));
    for(let presence of Object.values(payload)){
      const userModel : Partial<IAuthModel> = (presence as any).at(0).user;
      // console.log(userModel);
      this.mapUserId2UserModel.set(userModel.id, userModel);
    }
    // console.log("New update value", this.mapUserId2UserModel);
    this.subject.next(this.mapUserId2UserModel);
  }
}
