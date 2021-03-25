import { RoleType } from "../role/roletype.enum";

export interface IJwtPayload {
  id: number;
  email: string;
  username: string;
  roles: RoleType[];
  iat?: Date;
}