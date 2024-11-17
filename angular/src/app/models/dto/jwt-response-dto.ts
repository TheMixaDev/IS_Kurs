import {User} from "../user";

export interface JwtResponseDto {
  token: string;
  user: User;
}
