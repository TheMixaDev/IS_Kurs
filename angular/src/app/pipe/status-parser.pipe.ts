import { Pipe, PipeTransform } from '@angular/core';
import {IdeaStatus} from "../models/idea";

@Pipe({
  standalone: true,
  name: 'statusParser'
})
export class StatusParserPipe implements PipeTransform {
  transform(value: IdeaStatus): string {
    switch (value) {
      case IdeaStatus.PENDING:
        return 'Ожидает';
      case IdeaStatus.REJECTED:
        return 'Отклонена';
      case IdeaStatus.APPROVED:
        return 'Принята';
      default:
        return 'Неизвестен';
    }
  }
}
