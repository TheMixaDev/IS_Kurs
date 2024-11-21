import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {FormsModule} from "@angular/forms";
import {UserService} from "../../../services/server/user.service";
import {AlertService} from "../../../services/alert.service";
import {UserDto} from "../../../models/dto/user-dto";
import {CustomValidators} from "../../../misc/custom-validators";


@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent, FaIconComponent, FormsModule],
  template: `
    <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
      <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Изменение пароля
        </h3>
        <button (click)="closeModal()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
          <fa-icon [icon]="faClose" class="text-xl"/>
        </button>
      </div>
      <form [formGroup]="changePasswordForm" (ngSubmit)="handleSubmit()">
        <div class="grid gap-4 mb-2 sm:grid-cols-2">
          <div>
            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Новый пароль</label>
            <input formControlName="password" type="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Введите пароль">
          </div>
          <div>
            <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Подтвердите пароль</label>
            <input formControlName="confirmPassword" type="password" id="confirmPassword" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Повторите пароль">
          </div>
        </div>
        @if(!changePasswordForm.valid || !passwordsMatch) {
          <span class="block mb-2">
            {{errors}}
          </span>
        }
        <ui-button type="submit" [disabled]="!changePasswordForm.valid || !passwordsMatch" color="primary">
          Изменить пароль
        </ui-button>
        <ui-button color="danger" class="ml-2" (click)="closeModal()">
          Закрыть
        </ui-button>
      </form>
    </div>
  `
})
export class ChangePasswordModalComponent {
  @Input() login: string = '';

  changePasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]),
    confirmPassword: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()])
  });

  get errors() {
    if (this.changePasswordForm.get('password')?.errors?.['required'] || this.changePasswordForm.get('password')?.errors?.['pattern'])
      return 'Не заполнено поле пароль.';
    if (this.changePasswordForm.get('password')?.errors?.['maxlength'])
      return 'Пароль не должен превышать 255 символов.';
    if (this.changePasswordForm.get('confirmPassword')?.errors?.['required'] || this.changePasswordForm.get('confirmPassword')?.errors?.['pattern'])
      return 'Не заполнено поле подтверждение пароля.';
    if (this.changePasswordForm.get('confirmPassword')?.errors?.['maxlength'])
      return 'Подтверждение пароля не должно превышать 255 символов.';
    if(!this.passwordsMatch)
      return 'Пароли не совпадают.'
    return '';
  }


  faClose = faClose;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  handleSubmit() {
    if (this.changePasswordForm.valid && this.passwordsMatch && this.login) {
      const newPassword = this.changePasswordForm.value.password;

      this.userService.updateUser(this.login, { password: newPassword } as UserDto).subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Пароль успешно изменен');
          this.closeModal(newPassword);
        },
        error: (error) => {
          this.alertService.showAlert('danger', 'Ошибка при изменении пароля: ' + (error?.error?.message || "Неизвестная ошибка"));
          console.error('Error changing password:', error);
          this.closeModal();
        }
      });
    }
  }

  closeModal(result : any = null) {
    this.activeModal.close(result);
  }


  get passwordsMatch(): boolean {
    return this.changePasswordForm.value.password === this.changePasswordForm.value.confirmPassword;
  }

}
