import {Team} from "./team";
import {Role} from "./role";

export interface User {
  login: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  team: Team | null;
  role: Role | null;
}
