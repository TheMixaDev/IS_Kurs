import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  forwardRef,
  OnInit
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  templateUrl: './ui-dropdown.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDropdownComponent),
      multi: true
    }
  ]
})
export class UiDropdownComponent implements ControlValueAccessor, OnInit {
  @Input() modelValue: any;
  @Input() options: any = {};
  @Input() disabled = false;
  @Output() modelValueChange = new EventEmitter<any>();
  @Output() changed = new EventEmitter<void>();
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('button') buttonRef!: ElementRef;

  showSelector = false;
  search = '';

  get optionsFiltered(): string[] {
    return Object.keys(this.options).filter(key =>
      this.options[key].toLowerCase().includes(this.search.toLowerCase())
    );
  }

  select(key: string): void {
    this.modelValueChange.emit(key);
    if (this.modelValue !== key) {
      this.changed.emit();
    }
    this.showSelector = false;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (!this.containerRef.nativeElement.contains(event.target)) {
      this.showSelector = false;
    }
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.modelValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    this.modelValueChange.subscribe((value) => {
      this.modelValue = value;
      this.onChange(value);
      this.onTouched();
    });
  }
}
