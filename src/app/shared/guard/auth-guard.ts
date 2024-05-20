import { CanActivateFn, UrlTree } from "@angular/router";
import { Observable, lastValueFrom } from "rxjs";
import { LoginService } from "../../services/beService/login.service";
import { inject } from "@angular/core";
import { StorageKeys } from "../constants/Constants.class";

export const AuthGuard : CanActivateFn = async () :  Promise<boolean>  => {
  const res = await lastValueFrom(isValidToken());
  // if reach here -> token is valid <- interceptor catch 401 unauthorized
  return isUserSignIn();
}

const isValidToken = () : Observable<any>  => {
  return inject(LoginService).validateToken(null);
}

const isUserSignIn = () : boolean => {
  const currentUser = localStorage.getItem(StorageKeys.USER_INFO);
  return !!(currentUser && JSON.parse(currentUser).id > -1); // same as Boolean(currentUser && JSON.parse(currentUser).id > -1)
}
