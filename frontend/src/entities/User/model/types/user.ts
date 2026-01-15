import { UserPermission } from '../consts/userPermission';
import { UserRoles } from '../consts/userRoles';

export interface IUser {
  id: number;
  email: string;
  role: UserRoles;
  permissions: UserPermission[];
}

export interface IUserForm {
  email: string;
  password: string;
  role: UserRoles;
  // для редактирования
  id?: number;
}
