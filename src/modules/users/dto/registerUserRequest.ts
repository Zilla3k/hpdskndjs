import type { Role } from "../../../shared/enums/roleEnums";

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}
