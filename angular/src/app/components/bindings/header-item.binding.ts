import {Component, HostBinding, Input} from "@angular/core";

@Component({
  selector: 'button[header-item]',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class HeaderItemBinding {
  @Input() active = false;
  @HostBinding('class') get classes() {
    return "block py-0 pr-4 pl-3 " +
      (this.active ? "rounded bg-transparent text-primary-700 p-0 dark:text-white" :
        "text-gray-700 border-gray-100 hover:bg-transparent border-0 hover:text-primary-700 p-0 dark:text-gray-400 dark:hover:text-white dark:hover:bg-transparent dark:border-gray-700");
  }
}
