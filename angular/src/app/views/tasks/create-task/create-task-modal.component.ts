import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faClose, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {UiButtonComponent} from '../../../components/ui/ui-button.component';
import {AlertService} from '../../../services/alert.service';
import {AuthService} from "../../../services/server/auth.service";
import {TaskService} from "../../../services/server/task.service";
import {TaskDto} from "../../../models/dto/task-dto";
import {TaskPriority} from "../../../models/task";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {CustomValidators} from "../../../misc/custom-validators";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-create-idea-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    NgClass,
  ],
  templateUrl: 'create-task-modal.component.html'
})
export class CreateTaskModalComponent {
  currentUser = this.authService.getUser();

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(2047), CustomValidators.noWhitespace()]),
  });

  get errors() {
    if (this.createForm.get('name')?.errors?.['required'] || this.createForm.get('name')?.errors?.['pattern'])
      return 'Не заполнено поле информация.';
    if (this.createForm.get('name')?.errors?.['maxlength'])
      return 'Длина поля информация не должна превышать 2047 символов.';
    return '';
  }

  constructor(
    private taskService: TaskService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private authService: AuthService,
    private router: Router
  ) {}


  handleSubmit() {
    if (this.createForm.valid) {
      const taskData = this.createForm.value as TaskDto;
      taskData.storyPoints = 0;
      taskData.priorityEnum = TaskPriority.MEDIUM;
      this.createTask(taskData);
    }
  }

  createTask(taskData: TaskDto) {
    this.taskService.createTask(taskData).subscribe(task => {
      if (!(task instanceof HttpErrorResponse)) {
        this.alertService.showAlert('success', 'Задача успешно создана');
        this.router.navigate([`tasks/${task.id}`]);
        this.closeModal();
      }
    })
  }

  closeModal() {
    this.activeModal.close();
  }

  protected readonly faPlus = faPlus;
  protected readonly faClose = faClose;
  protected readonly faTrash = faTrash;
}
