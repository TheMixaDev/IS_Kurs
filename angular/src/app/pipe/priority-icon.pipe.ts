import {Pipe, PipeTransform} from '@angular/core';
import {TaskPriority} from "../models/task";
import {
  faAngleDown,
  faAnglesUp,
  faCircleQuestion, faEquals,
} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from "@fortawesome/fontawesome-common-types";

@Pipe({
  standalone: true,
  name: 'priorityIcon'
})
export class PriorityIconPipe implements PipeTransform {
  transform(value: TaskPriority): { icon: IconDefinition, color: string } {
    switch (value) {
      case TaskPriority.LOW:
        return {icon: faAngleDown, color: 'green'};
      case TaskPriority.MEDIUM:
        return {icon: faEquals, color: 'blue'};
      case TaskPriority.CRITICAL:
        return {icon: faAnglesUp, color: 'red'};
      default:
        return {icon: faCircleQuestion, color: 'gray'};
    }
  }
}
