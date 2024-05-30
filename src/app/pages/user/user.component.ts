import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/beService/supabase.service';
import { UserService } from '../../services/beService/user.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/featService/toast.service';
import { OnlineUserService } from '../../shared/app-state/online-user.service';
import { FormGroup, FormBuilder, Form, Validators } from '@angular/forms';
import { Constant, StorageKeys } from '../../shared/constants/Constants.class';
import { AuthStateService } from '../../shared/app-state/auth-state.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  ori_users: any;
  users: any;
  mapRoleId2UserCnt: Map<number, number> = new Map();
  mapUserId2UserModelOnlineTracking = new Map();

  dialog : {
    isVisibleDialog : boolean,
    isEditDialog : boolean,
    isCreateDialog : boolean,
    selectedUser : any,
    header: string,
  } = {
    isVisibleDialog: false,
    isEditDialog : false,
    isCreateDialog : false,
    selectedUser : null,
    header: '',
  }

  changePasswordDialog : {
    isVisibleDialog: boolean,
    header: string,
    selectedUser: any,
    newPassword: string
  } = {
    isVisibleDialog: false,
    header: 'Change password',
    selectedUser: null,
    newPassword: ''
  }
  GENDER = ['Nam', 'Nữ']
  ROLES : any[]= [];

  userForm !: FormGroup

  // subscription
  userSubscription!: Subscription;
  // filter
  ONLINE = [{status: 'Online', code: 1}, {status: 'Offline', code: 0}];

  constructor(
    private supabaseService: SupabaseService,
    private userService: UserService,
    private toastService : ToastService,
    private onlineUserService : OnlineUserService,
    private formBuilder : FormBuilder,
    private authStateService : AuthStateService,
    private confirmationService: ConfirmationService
  ){}

  ngOnInit(): void {
    this.initUserForm();
    this.subscribeOnlineUserTracker();
    this.initRoles();
    this.initUsers();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  initUsers(){
    this.loading = true;
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.userService.getUsers().subscribe({
      next: (res : any) => {
        console.log(res);
        this.users = res;
        this.ori_users = JSON.parse(JSON.stringify(res));
        this.initMapRoleId2UserCnt();
        this.loading = false;
      },
      error: (err : any) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
        this.loading = false;
      }
    })
  }

  initUserForm() {
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: [null, [Validators.required]],
      birthday: [null, [Validators.required]],
      role: [null, [Validators.required]]
    })
  }

  initMapRoleId2UserCnt() {
    this.mapRoleId2UserCnt = new Map();
    this.users.forEach((user : any) => {
      this.mapRoleId2UserCnt.set(user.role.roleId, (this.mapRoleId2UserCnt.get(user.role.roleId) ?? 0) + 1);
    })
  }

  initRoles() {
    for(let [key,value] of Object.entries(Constant.ROLES)){
      this.ROLES.push({
        roleId : value,
        description: key
      })
    }
    console.log(this.ROLES);
  }

  subscribeOnlineUserTracker(){
    this.onlineUserService.subscribe((m) => {
      console.log(m);
      this.mapUserId2UserModelOnlineTracking = m;
    })
  }

  getUserStatusString(userId : number){
    if(this.mapUserId2UserModelOnlineTracking.has(userId)) return "Online";
    return "Offline";
  }

  showEditUserDialog(user : any){
    // console.log(user);
    this.dialog = {
      isVisibleDialog: true,
      isEditDialog: true,
      isCreateDialog : false,
      selectedUser: user,
      header: 'Edit user'
    }
    this.userForm.patchValue({
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      birthday: new Date(user.birthday),
      role: user.role
    })
  }
  showCreateUserDialog(){
    this.dialog = {
      isVisibleDialog: true,
      isEditDialog: false,
      isCreateDialog : true,
      selectedUser: null,
      header: 'Create user'
    }
    this.initUserForm();
  }
  hideUserDialog() {
    this.dialog = {
      isVisibleDialog: false,
      isEditDialog: false,
      isCreateDialog: false,
      selectedUser: null,
      header: '',
    }
    this.initUserForm();
  }

  handleSaveUserDialog() {
    const userFrmValue = this.userForm.value;

    if(userFrmValue.username.trim() === ''){
      this.toastService.showError('Tên đăng nhập không được để trống!');
      return;
    }

    if(this.dialog.isCreateDialog && userFrmValue.password === ''){
      this.toastService.showError('Mật khẩu không được để trống!');
      return;
    }

    if(userFrmValue.fullname.trim() === ''){
      this.toastService.showError("Họ tên không được để trống!");
      return;
    }

    if(userFrmValue.email.trim() === ''){
      this.toastService.showError('Email không được để trống!');
      return;
    }

    if(!userFrmValue.gender){
      this.toastService.showError('Giới tính không được để trống!');
      return;
    }

    if(!userFrmValue.birthday){
      this.toastService.showError("Ngày sinh không được để trống!");
      return;
    }

    if(!userFrmValue.role){
      this.toastService.showError("Quyền không được để trống!");
      return;
    }

    if(this.userForm.get('email')?.hasError('email')){
      this.toastService.showError('Email không hợp lệ!');
      return;
    }
    if(this.dialog.isEditDialog){
      const payload = {
        fullname: userFrmValue.fullname.trim(),
        email: userFrmValue.email.trim(),
        gender: userFrmValue.gender,
        birthday: new Date(userFrmValue.birthday).toISOString(),
        roleId: userFrmValue.role.roleId
      }

      this.userService.updateUser(this.dialog.selectedUser.id, payload).subscribe({
        next: async (res) => {
          console.log(res);

          await this.supabaseService.updateUser({
            id: this.dialog.selectedUser.id,
            ...payload
          })
          this.authStateService.dispatch(payload);
          this.toastService.showSucces("Cập nhật thành công!");
          this.initUsers();
          this.hideUserDialog();
        },
        error: (err) => {
          console.log(err);
          this.toastService.showError(err.error.Message);
        }
      })
    }else if(this.dialog.isCreateDialog){

      const payload = {
        fullname: userFrmValue.fullname.trim(),
        username: userFrmValue.username.trim(),
        password: userFrmValue.password,
        email: userFrmValue.email.trim(),
        gender: userFrmValue.gender,
        birthday: new Date(userFrmValue.birthday).toISOString(),
        roleId: userFrmValue.role.roleId
      }
      this.userService.createUser(payload).subscribe({
        next: async (res) => {
          console.log(res);
          const newlyCreatedUserId = res.id;

          await this.supabaseService.createUser({
            id : newlyCreatedUserId,
            ...payload
          })

          this.initUsers();
          this.hideUserDialog();
          this.toastService.showSucces("Thêm mới thành công");
        },
        error: (err) => {
          console.log(err);
          this.toastService.showError(err.error.Message);
        }
      })
    }
  }

  showChangePassworDialog(user:any){
    this.changePasswordDialog = {
      isVisibleDialog: true,
      header: 'Change password',
      selectedUser: user,
      newPassword: ''
    }
  }

  hideChangePasswordDialog(){
    this.changePasswordDialog = {
      isVisibleDialog: false,
      header: 'Change password',
      selectedUser: null,
      newPassword: ''
    }
  }

  handleSaveChangePasswordDialog(){
    console.log(this.changePasswordDialog);

    const payload = {
      userId: this.changePasswordDialog.selectedUser.id,
      oldPassword: null,
      newPassword: this.changePasswordDialog.newPassword
    }

    this.userService.updatePassword(payload).subscribe({
      next: async (res : any) => {
        console.log(res);

        await this.supabaseService.updateUserPassword({
          id: payload.userId,
          password: payload.newPassword
        })
        this.hideChangePasswordDialog();
        this.toastService.showSucces("Cập nhật thành công!");
      },
      error: (err : any) => {
        console.log(err);
        this.toastService.showError(err.err.Message);
      }
    })
  }

  handleSearchFilter(table: Table, event: any){
    table.filterGlobal(event.target.value, 'contains');
  }

  handleFilterByStatus(event : any){
    const value = event.value;
    this.users = JSON.parse(JSON.stringify(this.ori_users));

    if(value){
      if(value.code === 0){
        this.users = this.users.filter((u : any) => !this.mapUserId2UserModelOnlineTracking.has(u.id))
      }else if(value.code === 1){
        this.users = this.users.filter((u : any) => this.mapUserId2UserModelOnlineTracking.has(u.id))
      }
    }
  }

  handleActiveUser(event : any, user:any){
    const checked = event.checked;
    this.confirmationService.confirm({
      message: `Do you want to set this user state to ${checked ? 'Active' : 'Inactive'}?`,
      header: 'Update Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",
      reject: () => {
        user.active = !checked
      },
      accept: () => {
        if(checked){
          // Active
          this.loading = true;
          this.userService.activeUser(user.id).subscribe({
            next: async (res) => {
              console.log(res);
              await this.supabaseService.updateUserActiveState({
                id: user.id,
                active: true
              })
              this.toastService.showSucces("Cập nhật thành công")
              this.loading = false;
            },
            error: (err) => {
              console.log(err);
              user.active = !checked;
              this.toastService.showError(err.error.Message);
              this.loading = false;
            }
          })
        }else{
          this.loading = true;
          this.userService.inactiveUser(user.id).subscribe({
            next: async (res) => {
              console.log(res);
              await this.supabaseService.updateUserActiveState({
                id: user.id,
                active: false
              })
              this.toastService.showSucces("Cập nhật thành công")
              this.loading = false;
            },
            error: (err) => {
              console.log(err);
              user.active = !checked;
              this.toastService.showError(err.error.Message);
              this.loading = false;
            }
          })
        }
      },
    });
  }
}
