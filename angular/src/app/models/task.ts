import {User} from "./user";
import {Sprint} from "./sprint";
import {Status} from "./status";

export interface Task {
  id: number;
  name: string;
  storyPoints: number | null;
  implementer: User | null;
  sprint: Sprint | null;
  status: Status;
  priorityEnum: TaskPriority;
  createdBy: User;
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  CRITICAL = 'CRITICAL'
}
