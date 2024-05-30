import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SupabaseService } from './services/beService/supabase.service';
import { AuthStateService } from './shared/app-state/auth-state.service';
import { IAuthModel } from './models/authModel';
import { Subscription } from 'rxjs';
import { OnlineUserService } from './shared/app-state/online-user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  userInfo: IAuthModel | undefined;
  sub: Subscription | undefined;
  isConnected: boolean = false;
  constructor(
    private primeNgConfig : PrimeNGConfig,
    private supabaseService : SupabaseService,
    private authStateService : AuthStateService,
    private onlineUserService : OnlineUserService,
    private router: Router
  ){};

  ngOnInit(): void {
    this.primeNgConfig.ripple = true;
    this.sub = this.authStateService.getAuthData().subscribe({
      next: (authModel) => {
        console.log("Subscribe authStateService in App Comp", authModel)
        if(authModel.id === -1){
          this.isConnected = false;
        }
        if(authModel.id > -1 && !this.isConnected){
          console.log("Connect to tracking online channel");
          this.isConnected = true;
          this.userInfo = authModel;
          this.subscribeOnlineTracking();
          this.subscribeUserAccountState();
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

  subscribeUserAccountState() {
    console.log("Sub")
    this.supabaseService.subscribeUserAccountStateTable((payload : any) => {
      switch (payload.eventType) {
        case "UPDATE":
          if(payload.new.id === this.userInfo?.id && payload.new.active === false){
            this.router.navigate(['login']);
          }
      }
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
