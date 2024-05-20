import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/beService/login.service';
import { ForgetPasswordService } from '../../services/beService/forget-password.service';
import { ToastService } from '../../services/featService/toast.service';
import { StorageKeys } from '../../shared/constants/Constants.class';
import { UserService } from '../../services/beService/user.service';
import { Router } from '@angular/router';
import { AuthStateService } from '../../shared/app-state/auth-state.service';
import { SupabaseService } from '../../services/beService/supabase.service';
import { Subscription } from 'rxjs';

interface OTP {
  otpCodeId : number,
  otpCodeValue : string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginFormGroup !: FormGroup;
  forgetPasswordFormGroup !: FormGroup;
  updatePasswordFormGroup !: FormGroup;
  otp : OTP =  {
    otpCodeId: 0,
    otpCodeValue: "",
  }
  disableOtpInput: boolean = false;
  loading : boolean = false;
  loginInfoValidator = {
    isEmptyUsername : false,
    isEmptyPassword : false,
    incorrectUsername : false,
    incorrectPassword : false,
    message : ''
  }
  forgetPasswordValidator = {
    isEmptyUsername: false,
    isEmptyEmail: false,
    isWrongEmailFormat: false,
    isIncorrectUsername: false,
    isIncorrectEmail: false,
    message: '',
  }
  updatePasswordValidator = {
    isEmptyPassword: false
  }
  validations = {
    'username': [
      { type: 'required', message: 'Tên người dùng không được để trống!' },
    ],
    'password': [
      {type: 'required', message: 'Mật khẩu không được để trống!'}
    ],
    'email': [
      {type: 'required', message: 'Email không được để trống!'},
      {type: 'email', message: 'Email không hợp lệ!'}
    ]
  };
  resetPasswordModel = {
    isVisibleResetPasswordModel : false,
    active: 0,
  }
  userIdForUpdatePassword: number = -1;
  // subscription
  loginSub !: Subscription
  forgetPasswrdSub !: Subscription
  authCodeSub !: Subscription
  updatePasswrdSub !: Subscription
  constructor(
    private formBuilder : FormBuilder,
    private loginService : LoginService,
    private forgetPassword : ForgetPasswordService,
    private toastService : ToastService,
    private userService : UserService,
    private router : Router,
    private authStateService: AuthStateService,
    private supabaseService: SupabaseService
  ) {

  }
  ngOnInit(): void {
    localStorage.clear();
    this.initializeLoginForm();
    this.initializeForgetPasswordForm();
    this.initializeUpdatePasswordForm();
    this.supabaseService.unsubscribeTrackingChannel();
  }

  ngOnDestroy(): void {
    console.log("Login destroy");
    this.loginSub?.unsubscribe();
    this.forgetPasswrdSub?.unsubscribe();
    this.updatePasswrdSub?.unsubscribe();
    this.authCodeSub?.unsubscribe();
  }

  initializeLoginForm() {
    this.loginFormGroup = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  initializeForgetPasswordForm() {
    this.forgetPasswordFormGroup = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    })
  }

  initializeUpdatePasswordForm() {
    this.updatePasswordFormGroup = this.formBuilder.group({
      password: ['', [Validators.required]],
    })
  }
  login() {
    const loginForm = this.loginFormGroup.value;
    console.log(loginForm);

    if(loginForm.username === '' || loginForm.password === ''){
      this.loginFormGroup.markAllAsTouched();
      this.loginInfoValidator.isEmptyPassword = this.loginInfoValidator.isEmptyUsername = true;
      return;
    }
    this.loading = true;
    const payload = {
      username : loginForm.username,
      password : loginForm.password
    }
    this.loginSub = this.loginService.login(payload).subscribe({
      next: (res) => {
        console.log('login successfully', res);
        this.loginService.doLogin(res);
        this.authStateService.dispatch({
          id: res.user.id,
          username: res.user.username,
          fullname: res.user.fullname,
          roleId: res.user.role.roleId
        })
        this.loading = false;
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.log(err);
        if(err.error.Message == 'Tên đăng nhập không chính xác! Vui lòng kiểm tra lại.'){
          this.setLoginValidator(false, false, true, false, "Tên đăng nhập không chính xác!");
        }else if(err.error.Message == 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.'){
          this.setLoginValidator(false, false, false, true, "Mật khẩu không chính xác!");
        }else{
          this.toastService.showError("Lỗi kết nối tới server");
        }
        this.loading = false;
      }
    })
  }
  setLoginValidator(isEmptyUsername: boolean = false, isEmptyPassword: boolean = false, incorrectUsername: boolean = false, incorrectPassword: boolean = false, message: string = ''){
    this.loginInfoValidator.isEmptyUsername = isEmptyUsername;
    this.loginInfoValidator.isEmptyPassword = isEmptyPassword;
    this.loginInfoValidator.incorrectUsername = incorrectUsername;
    this.loginInfoValidator.incorrectPassword = incorrectPassword;

    this.loginInfoValidator.message = message;
  }
  patchForgetPasswordValidator(validatorInfo: any) {
    this.forgetPasswordValidator = {...this.forgetPasswordValidator, ...validatorInfo};
  }
  showResetPasswordModel() {
    console.log("Open reset passwrd model");

    this.initializeForgetPasswordForm();
    this.initializeUpdatePasswordForm();
    this.resetPasswordModel = {
      isVisibleResetPasswordModel: true,
      active: 0
    }
    this.otp = {
      otpCodeId: 0,
      otpCodeValue: ""
    }
    this.userIdForUpdatePassword = -1;
  }

  hideResetPasswordModel() {
    console.log("Close reset password model");
    this.resetPasswordModel.isVisibleResetPasswordModel = false;
  }

  forgetPasswordHandler(nextCallBack: any) {
    console.log("Handle Step 01");
    const forgetPasswordForm = this.forgetPasswordFormGroup.value;
    console.log("ForgetPassword form in step 01", forgetPasswordForm);
    if(forgetPasswordForm.username === ''  || forgetPasswordForm.email === ''){
      this.forgetPasswordFormGroup.markAllAsTouched();
      this.patchForgetPasswordValidator({
        isEmptyUsername: true,
        isEmptyEmail: true,
      })
      console.log(this.forgetPasswordValidator);
      return;
    }
    if(this.forgetPasswordFormGroup.get("email")?.hasError("email")){
      this.forgetPasswordFormGroup.markAllAsTouched();
      this.patchForgetPasswordValidator({
        isWrongEmailFormat: true,
      })
      return;
    }
    this.loading = true;
    const payload = {
      username: forgetPasswordForm.username,
      email: forgetPasswordForm.email
    }
    this.forgetPasswrdSub = this.forgetPassword.forgetPassword(payload).subscribe({
      next: (res) => {
        console.log("Response from forgetpassword", res);
        this.otp.otpCodeId = res.otpCodeId;
        console.log("OTP Object", this.otp);
        nextCallBack.next();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        if(err.status === 404){
          console.log("404");
          this.patchForgetPasswordValidator({
            isIncorrectUsername: true,
            message: err.error.Message
          })
        }else if(err.status === 409){
          console.log("409");
          this.patchForgetPasswordValidator({
            isIncorrectEmail: true,
            message: err.error.Message
          })
        }else{
          this.toastService.showError(err.error.Message);
        }
        this.loading = false;
      }
    })
  }

  resentOtpCode(){
    this.disableOtpInput = true;
    this.otp = {
      otpCodeId: 0,
      otpCodeValue: ""
    }
    const forgetPasswordForm = this.forgetPasswordFormGroup.value;
    const payload = {
      username: forgetPasswordForm.username,
      email: forgetPasswordForm.email
    }
    this.forgetPasswrdSub.unsubscribe();
    this.forgetPasswrdSub = this.forgetPassword.forgetPassword(payload).subscribe({
      next: (res) => {
        this.toastService.showSucces("Gửi lại mã OTP mới thành công! Vui lòng kiểm tra email đăng ký!")
        console.log("Response from forgetpassword", res);
        this.otp.otpCodeId = res.otpCodeId;
        console.log("OTP Object", this.otp);
        this.disableOtpInput = false;
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
        this.disableOtpInput = false;
      }
    })
  }

  otpAuthenticationHandler(nextCallBack : any) {
    this.loading = true;
    console.log(this.otp);
    const payload = {
      "otpCodeId": this.otp.otpCodeId,
      "code": this.otp.otpCodeValue
    }
    this.authCodeSub = this.forgetPassword.authenticateOtpCode(payload).subscribe({
      next: (res) => {
        this.toastService.showSucces("Xác thực thành công!");
        this.userIdForUpdatePassword = res.userId;
        localStorage.setItem(StorageKeys.TOKEN, res.token);
        nextCallBack.emit();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
        this.loading = false;
      }
    })
  }

  updatePasswordHandler() {
    const updatePasswordForm = this.updatePasswordFormGroup.value;
    console.log("UpdatePasswordForm", updatePasswordForm)
    if(updatePasswordForm.password === ''){
      this.updatePasswordFormGroup.markAsDirty();
      this.updatePasswordValidator.isEmptyPassword = true;
      return;
    }
    this.loading = true;
    const payload = {
      userId: this.userIdForUpdatePassword,
      oldPassword: null,
      newPassword: updatePasswordForm.password
    }

    this.updatePasswrdSub = this.userService.UpdatePassword(payload).subscribe({
      next: (res) => {
        this.toastService.showSucces("Cập nhật mật khẩu thành công!");
        this.loading = false
        this.hideResetPasswordModel();
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error.Message);
      }
    })
  }
}
