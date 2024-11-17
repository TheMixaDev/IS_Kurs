import {Component, HostBinding} from "@angular/core";

@Component({
  selector: 'tr[table-row]',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class TableRowComponent {
  @HostBinding('class') classes = 'border-b dark:border-gray-700';
}
