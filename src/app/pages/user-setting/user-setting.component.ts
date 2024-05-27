import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageKeys } from '../../shared/constants/Constants.class';
import { ToastService } from '../../services/featService/toast.service';
import { UserService } from '../../services/beService/user.service';
import { SupabaseService } from '../../services/beService/supabase.service';
import { ConfirmationService } from 'primeng/api';
import { AuthStateService } from '../../shared/app-state/auth-state.service';
@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrl: './user-setting.component.scss'
})
export class UserSettingComponent implements OnInit,OnDestroy {
  loading: boolean = false;
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;

  userInfo : any;
  userIn4Frm !: FormGroup
  updatePasswordFrm !: FormGroup

  MENU_KEY = {
    'Profile': 1,
    'ChangePassword': 2
  }

  GENDER = ['Nam', 'Nữ']
  constructor(
    private formBuilder : FormBuilder,
    private toastService : ToastService,
    private userService : UserService,
    private supabaseService : SupabaseService,
    private confirmationService : ConfirmationService,
    private authStateService : AuthStateService
  ){

  };

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
    this.items = [
      {
        key : this.MENU_KEY.Profile,
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          if(this.activeItem?.['key'] !== this.MENU_KEY.Profile){
            this.initUserIn4Frm();
          }
        }
      },
      {
        key : this.MENU_KEY.ChangePassword,
        label: 'Change password',
        icon: 'pi pi-lock',
        command: () => {
          if(this.activeItem?.['key'] !== this.MENU_KEY.ChangePassword){
            this.initUpdatePasswordFrm();
          }
        }
      },
    ];
    this.activeItem = this.items.at(0);
    this.initUserIn4Frm();
    this.initUpdatePasswordFrm();
  }

  ngOnDestroy(): void {

  }

  initUserIn4Frm() {
    this.userIn4Frm = this.formBuilder.group({
      username: [this.userInfo.username],
      fullname: [this.userInfo.fullname, [Validators.required]],
      email: [this.userInfo.email, [Validators.required, Validators.email]],
      gender: [this.userInfo.gender, [Validators.required]],
      dob: [new Date(this.userInfo.birthday), [Validators.required]]
    })
  }
  initUpdatePasswordFrm() {
    this.updatePasswordFrm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required]]
    })
  }
  onActiveItemChange(event:any){
    this.activeItem = event;
  }

  confirmUpdateUserIn4(event:any){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to update user information ?',
      header: 'Update Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => this.handleUpdateUserIn4(),
    });
  }

  confirmUpdateUserPassword(event:any){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to update user password ?',
      header: 'Update Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => this.handleUpdateUserPassword(),
    });
  }

  handleUpdateUserIn4(){
    const userIn4Frm = this.userIn4Frm.value;

    if(userIn4Frm.fullname.trim() === ""){
      this.toastService.showError("Họ tên không được để trống!");
      return;
    }

    if(userIn4Frm.email.trim() === ""){
      this.toastService.showError("Email không được để trống!");
      return;
    }
    const payload = {
      fullname: userIn4Frm.fullname.trim(),
      email: userIn4Frm.email.trim(),
      gender: userIn4Frm.gender,
      birthday: new Date(userIn4Frm.dob).toISOString(),
      roleId: this.userInfo.roleId
    }

    this.userService.updateUser(this.userInfo.id, payload).subscribe({
      next: async (res) => {
        console.log(res);
        await this.supabaseService.updateUser({
          id: this.userInfo.id,
          ...payload
        })
        this.authStateService.dispatch(payload);
        this.toastService.showSucces('Cập nhật thành công!');
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
      }
    });
  }

  handleUpdateUserPassword(){
    const passwordForUpdateFrm = this.updatePasswordFrm.value;

    if(passwordForUpdateFrm.oldPassword === ""){
      this.toastService.showError("Old password can not be empty!");
      return;
    }

    if(passwordForUpdateFrm.newPassword === ""){
      this.toastService.showError("Password can not be empty!");
      return;
    }

    if(passwordForUpdateFrm.newPassword !== passwordForUpdateFrm.confirmNewPassword){
      this.toastService.showError("Password and Confirm password does not match!");
    }

    const payload = {
      userId : this.userInfo.id,
      oldPassword: passwordForUpdateFrm.oldPassword,
      newPassword: passwordForUpdateFrm.newPassword
    }

    this.userService.updatePassword(payload).subscribe({
      next: async (res) => {
        console.log(res);
        await this.supabaseService.updateUserPassword({
          id: payload.userId,
          password: payload.newPassword
        })
        this.initUpdatePasswordFrm();
        this.toastService.showSucces('Cập nhật mật khẩu thành công!');
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
      }
    })
  }
}
