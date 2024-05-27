export interface IAuthModel {
  id: number,
  username: string,
  fullname: string,
  email: string,
  roleId: number,
  gender ?: string,
  birthday ?: Date,
}

export const INIT_AUTH_MODEL : IAuthModel = {
  id: -1,
  username: '',
  fullname: '',
  email: '',
  roleId: -1,
}
