export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  status: string;
  roles: string[];
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roleIds: string[];
}
