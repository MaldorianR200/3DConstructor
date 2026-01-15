import { IUser } from 'src/entities/User/model/types/user';

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: IUser;
  token: string;
}
