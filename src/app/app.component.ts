import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SupabaseService } from './services/beService/supabase.service';
import { AuthStateService } from './shared/app-state/auth-state.service';
import { IAuthModel } from './models/authModel';
import { Subscription } from 'rxjs';
import { OnlineUserService } from './shared/app-state/online-user.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  userInfo: IAuthModel | undefined;
  sub: Subscription | undefined
  constructor(
    private primeNgConfig : PrimeNGConfig,
    private supabaseService : SupabaseService,
    private authStateService : AuthStateService,
    private onlineUserService : OnlineUserService
  ){};

  ngOnInit(): void {
    this.primeNgConfig.ripple = true;
    this.sub = this.authStateService.getAuthData().subscribe({
      next: (authModel) => {
        console.log("Subscribe authStateService in App Comp", authModel)
        if(authModel.id > -1){
          console.log("run!");
          this.userInfo = authModel;
          this.subscribeOnlineTracking();
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  subscribeOnlineTracking(){
    this.supabaseService.subscribeTrackingChannel(this.userInfo, (presenceState) => {
      this.onlineUserService.update(presenceState)
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
