import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'ui-checkbox',
  template: `
    <div class="flex items-start">
      <div class="flex items-center h-5">
        <input id="hide"
               [(ngModel)]="value"
               (ngModelChange)="onChange($event)"
               class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
               type="checkbox"
               [disabled]="disabled">
      </div>
      <div class="ml-2 text-sm">
        <label for="hide" class="text-black dark:text-gray-300 cursor-pointer user-select-none">
          <ng-content></ng-content>
        </label>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    FormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiCheckboxComponent),
      multi: true
    }
  ]
})
export class UiCheckboxComponent implements ControlValueAccessor{
  @Input() disabled : boolean = false;
  value: any;

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
