import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { StorageKeys, Constant } from '../../constants/Constants.class';
import { ConfirmationService } from 'primeng/api';
import { AuthStateService } from '../../app-state/auth-state.service';
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  items: MenuItem[] | undefined;
  userInfo: any;
  ROLES:any = new Array(Object.keys(Constant.ROLES).length + 1);

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private authSateService : AuthStateService
  ){
  }

  ngOnInit() {
      this.initRoles();
      this.authSateService.getAuthData().subscribe({
        next: (m) => {
          this.userInfo = m;
        },
        error: (e) => {
          console.log(e);
        }
      })
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
                      routerLink: '/dashboard',
                      roles: [Constant.ROLES.Admin, Constant.ROLES.Manager]
                  },
                  {
                    label: 'Category',
                    icon: 'pi pi-objects-column',
                    routerLink: '/category',
                    roles: [Constant.ROLES.Admin, Constant.ROLES.Manager]
                  },
                  {
                    label: 'Product',
                    icon: 'pi pi-box',
                    routerLink: '/product',
                    roles: [Constant.ROLES.Admin, Constant.ROLES.Manager]
                  },
                  {
                    label: 'Bill',
                    icon: 'pi pi-money-bill',
                    routerLink: '/bill',
                    roles: [Constant.ROLES.Admin, Constant.ROLES.Manager, Constant.ROLES.Staff]
                  },
                  {
                    label: 'User',
                    icon: 'pi pi-user',
                    routerLink: '/user',
                    roles: [Constant.ROLES.Admin, Constant.ROLES.Manager]
                  }
              ]
          },
          {
              label: 'Profile',
              items: [
                  {
                      label: 'Settings',
                      icon: 'pi pi-cog',
                      routerLink: '/profile',
                      roles: [Constant.ROLES.Admin, Constant.ROLES.Manager, Constant.ROLES.Staff]
                  },
                  {
                      label: 'Logout',
                      icon: 'pi pi-sign-out',
                      command: () => this.logout(),
                      roles: [Constant.ROLES.Admin, Constant.ROLES.Manager, Constant.ROLES.Staff]
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

  initRoles(){
    for(let [key,value] of Object.entries(Constant.ROLES)){
      this.ROLES[value] = key
    }
  }

  canVisible(roles : number[]){
    return roles.indexOf(this.userInfo.roleId) !== -1;
  }
}
