import { Component, OnInit, Input } from '@angular/core';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { UiDropdownComponent } from '../../../components/ui/ui-dropdown.component';
import { AlertService } from '../../../services/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/server/role.service';
import { RoleDto } from '../../../models/dto/role-dto';
import {CustomValidators} from "../../../misc/custom-validators";
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-create-role-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    UiDropdownComponent,
    FormsModule,
    NgClass
  ],
  templateUrl: './create-role-modal.component.html'
})
export class CreateRoleModalComponent implements OnInit {
  @Input() role: Role | null = null;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]),
    responsibilities: new FormControl('', [Validators.required, CustomValidators.noWhitespace()]),
  });

  get errors() {
    if(this.createForm.get('name')?.errors?.['required'] || this.createForm.get('name')?.errors?.['pattern'])
      return 'Не заполнено поле название.';
    if(this.createForm.get('name')?.errors?.['maxlength'])
      return 'Длина поля название не должна превышать 255 символов.';
    if(this.createForm.get('responsibilities')?.errors?.['required'] || this.createForm.get('responsibilities')?.errors?.['pattern'])
      return 'Не заполнено поле обязанности.';
    return '';
  }

  isEditing: boolean = false;

  constructor(
    private roleService: RoleService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.role) {
      this.isEditing = true;
      this.createForm.patchValue({
        name: this.role.name,
        responsibilities: this.role.responsibilities,
      });
    }
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const roleData = this.createForm.value as RoleDto;
      if (this.isEditing) {
        this.updateRole(roleData);
      } else {
        this.createRole(roleData);
      }
    }
  }

  createRole(roleData: RoleDto) {
    this.roleService.createRole(roleData).subscribe(() => {
      this.alertService.showAlert('success', 'Роль успешно создана');
      this.roleService.initiateUpdate();
      this.closeModal();
    });
  }

  updateRole(roleData: RoleDto) {
    if(this.role)
      this.roleService.updateRole(this.role.id, roleData).subscribe(() => {
        this.alertService.showAlert('success', 'Роль успешно обновлена');
        this.roleService.initiateUpdate();
        this.closeModal();
      });
  }



  closeModal() {
    this.activeModal.close();
  }


  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle() : string { return this.isEditing ? 'Редактирование роли' : 'Создание роли' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить роль' : 'Создать роль' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }
}
