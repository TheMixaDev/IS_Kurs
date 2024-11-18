import {Component, HostBinding} from "@angular/core";

@Component({
  selector: 'div[tooltip]',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class TooltipBinding {
  @HostBinding('class') classes = 'absolute z-10 invisible inline-block px-3 py-2 mb-1 text-sm font-medium text-white transition-opacity duration-300 bg-gray-600 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700';
  @HostBinding('role') role = 'tooltip';
}
