import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/beService/dashboard.service';
import { ToastService } from '../../../services/featService/toast.service';
import { StorageKeys } from '../../../shared/constants/Constants.class';
import { OnlineUserService } from '../../../shared/app-state/online-user.service';
import { IAuthModel } from '../../../models/authModel';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  userInfo: any;
  mapUserId2UserModel !: Map<number, IAuthModel>
  dashboardInfo = {
    categoryCnt: 0,
    productCnt: 0,
    revenue: 0,
    userCnt: 0,
  };
  constructor(
    private dashboardService : DashboardService,
    private toastService : ToastService,
    private onlineUserService : OnlineUserService
  ){
  }

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!)
    this.onlineUserService.subscribe((map)=> {
      console.log("New value from onlineuser observable", map);
      this.mapUserId2UserModel = map;
      // this.mapUserId2UserModel.delete(this.userInfo.id);
    })

    this.initDashboardInfo();

  }

  initDashboardInfo() {
    this.loading = true;
    this.dashboardService.getDashboardIn4().subscribe({
      next: (res) => {
        console.log("Response from init dashboardInfo", res);
        this.dashboardInfo = {...res.dashboardInfo};
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
        this.loading = false;
      }
    })
  }



  handleSyncPresence() {

  }
}
