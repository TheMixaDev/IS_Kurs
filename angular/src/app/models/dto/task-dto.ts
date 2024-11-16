import {TaskPriority} from "../task";

export interface TaskDto {
  name: string;
  storyPoints: number;
  priorityEnum: TaskPriority;
}
