import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import {UiButtonComponent} from "../../../../components/ui/ui-button.component";
import {UiDropdownComponent} from "../../../../components/ui/ui-dropdown.component";

@Component({
  selector: 'app-add-risk-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    UiDropdownComponent
  ],
  templateUrl: 'add-risk-modal.component.html'
})
export class AddRiskModalComponent {
  @Input() dropdown: any = null;
  value: number = 0;


  constructor(
    private activeModal: NgbActiveModal
  ) {}

  closeModal(result : number | null) {
    this.activeModal.close(result);
  }

  addStatus() {
    this.closeModal(this.value);
  }

  protected readonly faPlus = faPlus;
  protected readonly faClose = faClose;
}
