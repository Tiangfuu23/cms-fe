import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { StorageKeys, Constant } from '../../constants/Constants.class';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  items: MenuItem[] | undefined;
  userInfo: any;
  ROLES:any = Constant.ROLES;
  constructor(private router: Router, private confirmationService: ConfirmationService){
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
  }

  ngOnInit() {
      this.items = [
          {
              separator: true
          },
          {
              label: 'Home',
              items: [
                  {
                      label: 'Dashboard',
                      icon: 'pi pi-home',
                      routerLink: '/dashboard'
                  },
                  {
                    label: 'Category',
                    icon: 'pi pi-objects-column',
                    routerLink: '/category'
                  },
                  {
                    label: 'Product',
                    icon: 'pi pi-box',
                    routerLink: '/product'
                  },
                  {
                    label: 'Bill',
                    icon: 'pi pi-money-bill',
                    routerLink: '/bill'
                  }
              ]
          },
          {
              label: 'Profile',
              items: [
                  {
                      label: 'Settings',
                      icon: 'pi pi-cog',
                      routerLink: '/profile'
                  },
                  {
                      label: 'Logout',
                      icon: 'pi pi-sign-out',
                      command: () => this.logout()
                  }
              ]
          },
          {
              separator: false
          }
      ];
  }
  logout() {
    this.confirmationService.confirm({
      message: 'Bạn có muốn đăng xuất?',
      header: 'Xác nhận đăng xuất',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => {
        this.router.navigate(["/login"]);
      }
    });
  }

  getAvatarLabel(){
    return this.userInfo.fullname.split(" ").at(-1).at(0);
  }
}
