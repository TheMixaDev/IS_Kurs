import {Component, HostBinding} from "@angular/core";

@Component({
  selector: 'td[table-cell]',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class TableCellComponent {
  @HostBinding('class') classes = 'px-4 py-3';
}
