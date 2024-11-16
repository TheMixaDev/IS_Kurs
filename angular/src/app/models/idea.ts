import {User} from "./user";
import {Task} from "./task";

export interface Idea {
  id: number;
  description: string;
  authorLogin: User;
  statusEnumId: IdeaStatus;
  task: Task | null;
}

export enum IdeaStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
}
