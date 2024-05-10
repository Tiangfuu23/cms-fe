import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IAppConfig, INIT_APP_CONFIG } from '../../models/app-config';
import { StorageKeys } from '../constants/Constants.class';

@Injectable({
  providedIn: 'root'
})
export class ConfigStateService {
  protected subject: BehaviorSubject<IAppConfig>;
  protected appConfig: IAppConfig;

  constructor()
  {
    let localAppConfig = localStorage.getItem(StorageKeys.APP_CONFIG);
    if (localAppConfig) {
      this.appConfig = JSON.parse(localAppConfig);
    } else {
      this.appConfig = JSON.parse(JSON.stringify(INIT_APP_CONFIG));
    }
    this.subject = new BehaviorSubject<IAppConfig>(this.appConfig);
  }

  public subscribe(callback: (model: IAppConfig) => void): Subscription {
    return this.subject.subscribe(callback); // callback ~ observer
  }

  public dispatch(payload: any | null): void {
    const data: Partial<IAppConfig> = payload as Partial<IAppConfig>;
    this.appConfig = {...this.appConfig, ...data};

    const dispatchedAppConfig: IAppConfig = JSON.parse(JSON.stringify(this.appConfig));
    localStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(dispatchedAppConfig));
    this.subject.next(dispatchedAppConfig);
  }
}
