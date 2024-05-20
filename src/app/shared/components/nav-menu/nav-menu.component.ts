import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { StorageKeys, Constant } from '../../constants/Constants.class';
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  items: MenuItem[] | undefined;
  userInfo: any;
  ROLES:any = Constant.ROLES;
  constructor(private router: Router){
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
    this.router.navigate(["/login"]);
  }
}
