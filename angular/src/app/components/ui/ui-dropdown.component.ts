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
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  templateUrl: './ui-dropdown.component.html',
  styles: `
    .hidden-dropdown {
      height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-bottom: 0;
      margin-top: 0;
      opacity: 0!important;
      color: transparent;
      cursor: default;
    }
  `,
  imports: [
    FormsModule,
    NgForOf,
    FaIconComponent
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
  @Input() allowReset = false;
  @Input() resetValue: any = null;
  @Input() searchOnly = false;
  @Input() searchInProgress = true;
  @Input() buttonHidden = false;
  @Input() searchHidden = false;
  @Output() modelValueChange = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() changed = new EventEmitter<void>();
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('button') buttonRef!: ElementRef;

  showSelector = false;
  search = '';

  get optionsFiltered(): string[] {
    if(!this.searchOnly) {
      return Object.keys(this.options).filter(key =>
        this.options[key].toLowerCase().includes(this.search.toLowerCase())
      );
    }
    return Object.keys(this.options);
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

  get isNotSelected() {
    return !this.options || this.options.length <= 0 || !this.modelValue || this.modelValue.length === 0 || this.modelValue * 1 === 0 || !this.options[this.modelValue];
  }

  protected readonly faSearch = faSearch;

  reset() {
    this.modelValueChange.emit(this.resetValue);
    this.changed.emit();
    this.search = this.resetValue;
    this.searchChange.emit(this.search);
    this.showSelector = false;
  }

  searchChangeEmit($event: any) {
    this.searchChange.emit(this.search);
  }

  triggerSelector() {
    setTimeout(() => {
      this.showSelector = !this.showSelector;
    }, 0);
  }
}
