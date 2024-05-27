import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/beService/dashboard.service';
import { ToastService } from '../../../services/featService/toast.service';
import { StorageKeys } from '../../../shared/constants/Constants.class';
import { OnlineUserService } from '../../../shared/app-state/online-user.service';
import { IAuthModel } from '../../../models/authModel';
import { SupabaseService } from '../../../services/beService/supabase.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  userInfo: any;
  dashboardInfo = {
    userCnt: 0,
  };

  dashboardInfoFake = {
    categoryCnt: 0,
    productCnt: 0,
    revenue: 0,
    // userCnt: 0,
  };
  // Entities List
  billsList: any[] | null = [];
  categoriesList: any[] | null = [];
  productsList: any[] | null = [];
  //
  mapUserId2UserModel!: Map<number, IAuthModel>;
  mapProductId2Product: Map<number, any> = new Map();

  // STATISTIC
  availableYears : number[] = [2022, 2023, 2024];
  selectedYear : number = this.availableYears.at(-1)!;
  data: any;
  options: any;
  bestSellers: any;
  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private onlineUserService: OnlineUserService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
    this.onlineUserService.subscribe((map) => {
      this.mapUserId2UserModel = map;
      // this.mapUserId2UserModel.delete(this.userInfo.id);
    });
    this.connectSupabase();
    this.initLineCharts();
    this.initBestSellersTbl();
    this.initDashboardInfo();

  }

  connectSupabase() {
    this.initDashboardInfoFake();
    this.subscribeCategoryTable();
    this.subscribeProductTable();
    this.subscribeBillTable();
    // this.subscribeBillProductTable();
  }

  async initDashboardInfoFake() {
    this.categoriesList = await this.supabaseService.getCategories();
    this.productsList = await this.supabaseService.getProducts();
    this.billsList = await this.supabaseService.getBills();

    this.productsList?.forEach((p) => {
      this.mapProductId2Product.set(p.id, p);
    });

    let revenue = 0;
    this.billsList?.forEach((bill) => {
      revenue += bill.totalPrice;
    });

    this.dashboardInfoFake = {
      ...this.dashboardInfoFake,
      categoryCnt: this.categoriesList?.length ?? -1,
      productCnt: this.productsList?.length ?? -1,
      revenue,
    };
  }

  subscribeCategoryTable() {
    this.supabaseService.subscribeCategoryTable((payload: any) => {
      console.log(payload);
      switch (payload.eventType) {
        case 'INSERT':
          this.dashboardInfoFake.categoryCnt += 1;
          break;
        case 'DELETE':
          this.dashboardInfoFake.categoryCnt -= 1;
          break;
      }
    });
  }

  subscribeProductTable() {
    this.supabaseService.subscribeProductTable((payload: any) => {
      console.log(payload);
      switch (payload.eventType) {
        case 'INSERT':
          this.dashboardInfoFake.productCnt += 1;
          break;
        case 'DELETE':
          this.dashboardInfoFake.productCnt -= 1;
      }
    });
  }

  subscribeBillTable() {
    this.supabaseService.subscribeBillTable((payload) => {
      console.log(payload);
      switch (payload.eventType) {
        case 'INSERT':
          this.dashboardInfoFake.revenue += payload.new.totalPrice;
          this.billsList?.push(payload.new);
          this.initLineCharts();
          this.initBestSellersTbl();
          break;
        case 'DELETE':
          const bill_idx = this.billsList?.findIndex(
            (bill: any) => bill.id === payload.old.id
          );
          if (bill_idx !== undefined && bill_idx !== -1) {
            this.dashboardInfoFake.revenue -=
              this.billsList?.at(bill_idx).totalPrice ?? 0;
            this.billsList = this.billsList?.filter((b) => b.id !== bill_idx)!;
            this.initLineCharts();
            this.initBestSellersTbl();
          }
      }
    });
  }

  initDashboardInfo() {
    this.loading = true;
    this.dashboardService.getDashboardIn4().subscribe({
      next: (res) => {
        console.log('Response from init dashboardInfo', res);
        this.dashboardInfo = { ...res.dashboardInfo };
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
        this.loading = false;
      },
    });
  }

  async initLineCharts() {
    const revenueStatistic = await this.supabaseService.getRevenueStatisticByYear(this.selectedYear!);
    console.log(revenueStatistic);

    let labels = [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12',
    ]
    const data = new Array(12).fill(0);
    revenueStatistic?.forEach(sta => {
      data[sta.month-1] = sta.revenue;
    })
    const currentDate = new Date();
    if(this.selectedYear === currentDate.getFullYear()) {
      const currentMonth = currentDate.getMonth() + 1;
      labels = [];
      for(let m = 1; m <= currentMonth; m++) labels.push(`T${m}`);
    }
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels,
      datasets: [
        {
          label: `${this.selectedYear}`,
          data,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4,
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  handleSelectedYearChange(event : any){
    this.selectedYear = event.value;
    this.initLineCharts();
  }

  async initBestSellersTbl(){
    this.bestSellers = await this.supabaseService.getBestSellers();
    console.log(this.bestSellers);
  }
}
