export interface IAuthModel {
  id: number,
  username: string,
  fullname: string,
  roleId: number
}

export const INIT_AUTH_MODEL : IAuthModel = {
  id: -1,
  username: '',
  fullname: '',
  roleId: -1,
}
