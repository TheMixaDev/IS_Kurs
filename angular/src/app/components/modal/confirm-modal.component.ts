import {Component, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UiButtonComponent} from "../ui/ui-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faClose, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {NgIf} from "@angular/common";


@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [
    UiButtonComponent,
    FaIconComponent,
    NgIf
  ],
  templateUrl: 'confirm-modal.component.html'
})
export class ConfirmModalComponent {
  @Input() icon = faExclamationTriangle;

  @Input() rejectColor = 'primary';
  @Input() confirmColor = 'danger';

  @Input() content = "";
  @Input() warning : string | null = null;
  constructor(private activeModal: NgbActiveModal) {
  }
  closeModal(val : string | null = null) {
    this.activeModal.close(val);
  }

  protected readonly faExclamationTriangle = faExclamationTriangle;
  protected readonly faClose = faClose;
}
