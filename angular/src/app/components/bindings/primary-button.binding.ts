import {Component, HostBinding, Input} from "@angular/core";

@Component({
  selector: 'button[primary]',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class PrimaryButtonBinding {
  @Input() classButton: string = '';
  @HostBinding('class') classResult = this.classes;

  get classes() : string {
    const additional = 'w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200'
    return [additional, this.classButton].join(" ")
  }
}
