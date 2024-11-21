import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faClose,
  faPlus,
  faPen,
  faLock,
  faTrash, faBan,
} from '@fortawesome/free-solid-svg-icons';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { UserService } from '../../../services/server/user.service';
import { AlertService } from '../../../services/alert.service';
import { UserDto } from '../../../models/dto/user-dto';
import { User } from '../../../models/user';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TeamService } from '../../../services/server/team.service';
import { RoleService } from '../../../services/server/role.service';
import { Team } from '../../../models/team';
import { Role } from '../../../models/role';
import { UiDropdownComponent } from '../../../components/ui/ui-dropdown.component';
import { ConfirmModalComponent } from '../../../components/modal/confirm-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal.component';
import {AuthService} from "../../../services/server/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    UiDropdownComponent,
    NgIf,
  ],
  templateUrl: 'create-user-modal.component.html',
})
export class CreateUserModalComponent implements OnInit {
  @Input() user: User | null = null;

  isEditing: boolean = false;

  createForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    teamId: new FormControl(0),
    roleId: new FormControl(0),
    password: new FormControl('') // Hidden password field
  });
  teams: { [key: number]: string } = {};
  roles: { [key: number]: string } = {};
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    private roleService: RoleService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();

    this.loadTeams();
    this.loadRoles();
    if (this.user) {
      this.isEditing = true;
      this.createForm.get('login')?.disable();
      if(this.currentUser?.role?.id != 1) {
        this.createForm.get('teamId')?.disable();
        this.createForm.get('roleId')?.disable();
      } else if(this.user.login == this.currentUser.login) {
        this.createForm.get('roleId')?.disable();
      }
      this.createForm.patchValue({
        ...this.user,
        teamId: this.user.team?.id || 0,
        roleId: this.user.role?.id || 0
      });
    }
  }

  loadTeams() {
    this.teamService.getAllTeams(true).subscribe((teams) => {
      if (!(teams instanceof HttpErrorResponse)) {
        this.teams = teams.reduce((acc, team) => {
          acc[team.id] = team.name;
          return acc;
        }, {} as { [key: string]: string });
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe((roles) => {
      if (!(roles instanceof HttpErrorResponse)) {
        this.roles = (roles as Role[]).reduce((acc, role) => {
          acc[role.id] = role.name;
          return acc;
        }, {} as { [key: string]: string });
      }
    });
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const userData = this.createForm.value as UserDto;
      let teamId = this.createForm.value.teamId || 0;
      let roleId = this.createForm.value.roleId || 0;
      let pass = () => {
        if (this.isEditing) {
          this.updateUser(userData, teamId, roleId);
        } else {
          this.createUser(userData, teamId, roleId);
        }
      }
      if(roleId == 1 && (!this.user || !this.user.role || this.user.role.id != 1)) {
        const modalRef = this.modalService.open(ConfirmModalComponent, {
          size: 'md'
        });
        modalRef.componentInstance.content = `Выбранная роль является ролью администратора, вы уверены, что хотите предоставить пользователю данную роль?`;
        modalRef.result.then((result) => {
          if (result === 'delete') {
            pass();
          }
        });
        return;
      }
      pass();
    }
  }


  createUser(userData: UserDto, teamId: number, roleId: number) {
    this.userService.registerUser(userData).subscribe(() => {
      this.patchTeamAndRole(userData.login, teamId, roleId, 'Пользователь успешно создан');
    });
  }

  updateUser(userData: UserDto, teamId: number, roleId: number) {
    if (!this.user) return;

    this.userService.updateUser(this.user.login, userData).subscribe({
      next: () => {
        if (!this.user) return;
        this.patchTeamAndRole(this.user.login, teamId, roleId, 'Пользователь успешно обновлен');
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при обновлении пользователя: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error updating user:', error);
      }
    });
  }

  patchTeamAndRole(login: string, teamId: number, roleId: number, message: string) {
    if(this.currentUser?.role?.id === 1) {
      this.userService.updateUserTeam(login, teamId).subscribe(() => {
        if(login != this.currentUser?.login) {
          this.userService.updateUserRole(login, roleId).subscribe(() => {
            this.alertService.showAlert('success', message);
            this.userService.initiateUpdate();
            this.authService.initiateUpdate();
            this.closeModal();
          });
        } else {
          this.alertService.showAlert('success', message);
          this.userService.initiateUpdate();
          this.authService.initiateUpdate();
          this.closeModal();
        }
      })
    } else {
      this.alertService.showAlert('success', message);
      this.userService.initiateUpdate();
      this.authService.initiateUpdate();
      this.closeModal();
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  openChangePasswordModal() {
    const modalRef = this.modalService.open(ChangePasswordModalComponent);

    if(this.user) {
      modalRef.componentInstance.login = this.user.login;
    }

    modalRef.result.then((newPassword) => {
      this.createForm.patchValue({ password: newPassword });
    }).catch(() => {});
  }

  openDeleteConfirmationModal() {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.content = `Вы уверены, что хотите отключить пользователя ${this.user?.login}?`;
    modalRef.componentInstance.warning = `Пользователь больше не сможет зайти в систему, но все его задачи будут сохранены. Пользователя можно будет подключить обратно в систему, установив пароль.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.deleteUser();
      }
    }).catch(() => {});
  }


  deleteUser() {
    if (!this.user) return;

    this.userService.wipeUser(this.user.login).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Пользователь успешно отключен');
        this.userService.initiateUpdate();
        this.closeModal();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при отключении пользователя: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error deleting user:', error);
      }
    });
  }

  get isPrivileged() {
    return this.currentUser?.role?.id === 1;
  }


  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;
  protected readonly faLock = faLock;

  get modalTitle(): string {
    return this.isEditing ?
      (this.isPrivileged ? 'Редактирование пользователя' : 'Настройки')
      : 'Создание пользователя';
  }
  get submitButtonText(): string {
    return this.isEditing ?
      (this.isPrivileged ? 'Обновить пользователя' : 'Сохранить')
      : 'Создать пользователя';
  }
  get submitButtonIcon(): IconDefinition {
    return this.isEditing ? this.faPen : this.faPlus;
  }
  get submitButtonColor(): string {
    return this.isEditing ? 'warning' : 'primary';
  }

  protected readonly faBan = faBan;
}
