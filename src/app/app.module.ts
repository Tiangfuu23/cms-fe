import { Input, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { customHttpInterceptor } from './shared/interceptors/custom-http.interceptor';
import { HttpClientModule ,HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

// Ng Module
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Password, PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StepperModule } from 'primeng/stepper';
import { InputOtpModule } from 'primeng/inputotp';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NavMenuComponent } from './shared/components/nav-menu/nav-menu.component';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { CategoryComponent } from './pages/category/category.component';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProductComponent } from './pages/product/product.component';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { BillComponent } from './pages/bill/bill.component';
import { UserSettingComponent } from './pages/user-setting/user-setting.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    NavMenuComponent,
    DashboardComponent,
    CategoryComponent,
    ProductComponent,
    BillComponent,
    UserSettingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    // Ng Module
    FormsModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    InputGroupModule,
    InputGroupAddonModule,
    RippleModule,
    DialogModule,
    BrowserAnimationsModule,
    StepperModule,
    InputOtpModule,
    ToastModule,
    MenuModule,
    AvatarModule,
    AvatarGroupModule,
    ProgressSpinnerModule,
    BadgeModule,
    TableModule,
    ConfirmDialogModule,
    TagModule,
    DropdownModule,
    InputNumberModule,
    InputSwitchModule,
    TabMenuModule,
    CalendarModule,
    ChartModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: customHttpInterceptor,
      multi: true,
    },
    MessageService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
