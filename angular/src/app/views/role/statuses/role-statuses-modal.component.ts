import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {faClose, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgIf, NgForOf} from "@angular/common";
import {TableComponent} from "../../../components/table/table.component";
import {TableRowComponent} from "../../../components/table/table-row.component";
import {TableCellComponent} from "../../../components/table/table-cell.component";
import {Status} from "../../../models/status";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {RoleService} from "../../../services/server/role.service";
import {AlertService} from "../../../services/alert.service";
import {UiDropdownComponent} from "../../../components/ui/ui-dropdown.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Role} from "../../../models/role";
import {StatusService} from "../../../services/server/status.service";
import {ConfirmModalComponent} from "../../../components/modal/confirm-modal.component";
import {HttpErrorResponse} from "@angular/common/http";
import {AddStatusModalComponent} from "./add-status/add-status-modal.component";
import {AuthService} from "../../../services/server/auth.service";


@Component({
  selector: 'app-role-statuses-modal',
  standalone: true,
  imports: [
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    FaIconComponent,
    NgIf,
    NgForOf,
    UiButtonComponent,
    UiDropdownComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: 'role-statuses-modal.component.html'
})
export class RoleStatusesModalComponent implements OnInit {
  @Input() role: Role | null = null;
  statuses: Status[] = [];
  faClose = faClose;
  faTrash = faTrash;
  availableStatuses: { [key: number]: string } = {};
  currentUser = this.authService.getUser();

  constructor(public activeModal: NgbActiveModal,
              private roleService: RoleService,
              private statusService: StatusService,
              private alertService: AlertService,
              private authService: AuthService,
              private modalService: NgbModal) {
    this.roleService.role$.subscribe(() => {
      setTimeout(this.updateStatuses.bind(this), 0);
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  get tableColumns() : string[] {
    let baseColumns = ['Название', 'Описание'];
    if(this.isAdmin) baseColumns.push('Действия');
    return baseColumns;
  }

  trackStatus(index: number, status: Status): number {
    return status.id;
  }

  ngOnInit() {
    this.updateStatuses();
  }

  updateStatuses() {
    if (this.role) {
      this.roleService.getRoleStatuses(this.role.id).subscribe(statuses => {
        if (statuses && !(statuses instanceof HttpErrorResponse)) {
          this.statuses = statuses as Status[];
          this.updateAvailableStatuses();
        }
      });
    }
  }

  updateAvailableStatuses() {
    this.statusService.getAllStatuses().subscribe(statuses => {
      if (statuses && !(statuses instanceof HttpErrorResponse)) {
        this.availableStatuses = (statuses as Status[]).reduce((acc: any, status) => {
          acc[status.id] = status.name;
          return acc;
        }, {});

        if (this.statuses) {
          this.statuses.forEach(status => {
            delete this.availableStatuses[status.id];
          });
        }
      }
    });
  }

  addStatus(id: number) {
    if(this.role && id)
      this.roleService.addRoleStatus(this.role.id, id).subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Статус успешно добавлен');
          this.updateStatuses();
        },
        error: (error) => {
          console.error('Error deleting release:', error);
          this.alertService.showAlert('danger', 'Ошибка при добавлении статуса.');
        }
      })
  }

  openAddStatusModal() {
    const modalRef = this.modalService.open(AddStatusModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.dropdown = this.availableStatuses;
    modalRef.result.then(data => {
      if(data as number) {
        this.addStatus(data);
      }
    });
  }

  deleteStatus(status: Status) {
    if(this.role) {
      const modalRef = this.modalService.open(ConfirmModalComponent, {
        size: 'md'
      });

      modalRef.componentInstance.content = `Вы уверены, что хотите удалить статус ${status.name} из роли ${this.role.name}?`;
      modalRef.result.then((result) => {
        if (result === 'delete' && this.role) {
          this.roleService.deleteRoleStatus(this.role.id, status.id).subscribe({
            next: () => {
              this.alertService.showAlert('success', 'Статус успешно удален');
              this.updateStatuses();
            },
            error: (error) => {
              console.error('Error deleting release:', error);
              this.alertService.showAlert('danger', 'Ошибка при удалении статуса.');
            }
          })
        }
      });
    }
  }
}
