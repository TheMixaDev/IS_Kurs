import { Component, Input } from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [
    NgClass
  ],
  template: `
    <button [type]="type" [ngClass]="classes" [disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {
  @Input() color: string = 'primary';
  @Input() type: string = 'button';
  @Input() classExtension: string = '';
  @Input() disabled: boolean = false;

  get classes(): string[] {
    const baseClasses = ['items-center', 'justify-center', 'font-medium', 'rounded-lg', 'text-sm', 'px-4', 'py-2', 'focus:outline-none', 'transition-opacity'];
    const colorClasses = [
      `bg-${this.color}-600`,
      `hover:bg-${this.color}-700`,
      `focus:ring-4`,
      `focus:ring-${this.color}-300`,
      `dark:bg-${this.color}-500`,
      `dark:hover:bg-${this.color}-600`,
      `dark:focus:ring-${this.color}-700`,
    ];
    const textClass = this.classExtension.includes('text') ? '' : 'text-white';
    const disabledClass = this.disabled ? 'opacity-25' : '';

    return [...baseClasses, ...colorClasses, textClass, disabledClass, this.classExtension];
  }
}
