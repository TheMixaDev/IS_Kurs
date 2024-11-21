import { Component, OnInit, Input } from '@angular/core';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { AlertService } from '../../../services/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Status } from '../../../models/status';
import { StatusService } from '../../../services/server/status.service';
import { StatusDto } from '../../../models/dto/status-dto';
import {CustomValidators} from "../../../misc/custom-validators";
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-create-status-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './create-status-modal.component.html'
})
export class CreateStatusModalComponent implements OnInit {
  @Input() status: Status | null = null;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]),
    description: new FormControl('', [Validators.required, CustomValidators.noWhitespace()]),
  });

  get errors() {
    if(this.createForm.get('name')?.errors?.['required'] || this.createForm.get('name')?.errors?.['pattern'])
      return 'Не заполнено поле название.';
    if(this.createForm.get('name')?.errors?.['maxlength'])
      return 'Длина поля название не должна превышать 255 символов.';
    if(this.createForm.get('description')?.errors?.['required'] || this.createForm.get('description')?.errors?.['pattern'])
      return 'Не заполнено поле описание.';
    return '';
  }

  isEditing: boolean = false;

  constructor(
    private statusService: StatusService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.status) {
      this.isEditing = true;
      this.createForm.patchValue({
        name: this.status.name,
        description: this.status.description,
      });
    }
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const statusData = this.createForm.value as StatusDto;
      if (this.isEditing) {
        this.updateStatus(statusData);
      } else {
        this.createStatus(statusData);
      }
    }
  }

  createStatus(statusData: StatusDto) {
    this.statusService.createStatus(statusData).subscribe(() => {
      this.alertService.showAlert('success', 'Статус успешно создан');
      this.statusService.initiateUpdate();
      this.closeModal();
    });
  }

  updateStatus(statusData: StatusDto) {
    if(this.status) {
      this.statusService.updateStatus(this.status.id, statusData).subscribe(() => {
        this.alertService.showAlert('success', 'Статус успешно обновлен');
        this.statusService.initiateUpdate();
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle(): string { return this.isEditing ? 'Редактирование статуса' : 'Создание статуса' }
  get submitButtonText(): string { return this.isEditing ? 'Обновить статус' : 'Создать статус' }
  get submitButtonIcon(): IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor(): string { return this.isEditing ? 'warning' : 'primary' }
}
