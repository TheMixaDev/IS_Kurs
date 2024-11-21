import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {UiButtonComponent} from "../../../../components/ui/ui-button.component";
import {Status} from "../../../../models/status";
import {UiDropdownComponent} from "../../../../components/ui/ui-dropdown.component";

@Component({
  selector: 'app-add-status-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    UiDropdownComponent
  ],
  templateUrl: 'add-status-modal.component.html'
})
export class AddStatusModalComponent {
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
