import {Pipe, PipeTransform} from '@angular/core';
import {TaskPriority} from "../models/task";

@Pipe({
  standalone: true,
  name: 'priorityParser'
})
export class PriorityParserPipe implements PipeTransform {
  transform(value: TaskPriority): string {
    switch (value) {
      case TaskPriority.LOW:
        return 'Низкий';
      case TaskPriority.MEDIUM:
        return 'Средний';
      case TaskPriority.CRITICAL:
        return 'Критичный';
      default:
        return 'Неизвестен';
    }
  }
}
