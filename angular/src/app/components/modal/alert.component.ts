import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgbAlert],
  template: `
    @if(isOpened) {
      <ngb-alert #alert [type]="type" (closed)="closed()" class="fixed m-2 w-[300px] text-sm" style="z-index: 99999999">
        {{ content }}
      </ngb-alert>
    }
  `
})
export class AlertComponent {
  @ViewChild('alert', { static: false }) alert!: NgbAlert;
  @Input() content = "";
  @Input() type = "";
  @Output() closedAlert = new EventEmitter <void>();
  isOpened = false;
  open() {
    if(this.isOpened) {
      return;
    }
    this.isOpened = true;
    setTimeout(() => {
      this.alert.close()
    }, 5000);
  }
  closed() {
    this.closedAlert.emit();
    this.isOpened = false;
  }
}
