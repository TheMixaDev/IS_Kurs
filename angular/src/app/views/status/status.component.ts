import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {faEdit, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {DatePipe, NgIf} from "@angular/common";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import { Status } from "../../models/status";
import { StatusService } from "../../services/server/status.service";
import { AlertService } from "../../services/alert.service";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import { initFlowbite } from "flowbite";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { CreateStatusModalComponent } from "./create-status/create-status-modal.component";
import {AuthService} from "../../services/server/auth.service";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [
    FaIconComponent,
    HeaderItemBinding,
    PrimaryButtonBinding,
    UiDropdownComponent,
    DatePipe,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent,
    NgIf,
    NgbTooltip
  ],
  templateUrl: './status.component.html'
})
export class StatusComponent implements OnInit {
  statuses: Status[] = [];
  currentUser = this.authService.getUser();

  initialized = false;

  constructor(private statusService: StatusService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {
    this.statusService.status$.subscribe(() => {
      this.updateStatuses();
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.loaderService.loader(true);
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

  ngOnInit() {
    this.updateStatuses();
    initFlowbite();
  }

  updateStatuses(){
    this.statuses = [];
    this.statusService.getAllStatuses().subscribe(statuses => {
      if(!this.initialized) {
        this.initialized = true;
        this.loaderService.loader(false);
      }
      if(statuses as Status[]) {
        this.statuses = statuses as Status[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о статусах");
      }
    });
  }

  openCreateModal() {
    this.modalService.open(CreateStatusModalComponent, {
      size: 'lg'
    });
  }

  openEditModal(status: Status) {
    if (status) {
      const modalRef = this.modalService.open(CreateStatusModalComponent, {
        size: 'lg'
      });
      modalRef.componentInstance.status = status;
    }
  }

  openDeleteModal(status: Status) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить статус "${status.name}"?`;
    modalRef.componentInstance.warning = `При удалении статуса, он удалится у всех ролей и задач.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.statusService.deleteStatus(status.id).subscribe({
          next: () => {
            this.alertService.showAlert('success', 'Статус успешно удален');
            this.updateStatuses();
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении статуса: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting status:', error);
          }
        });
      }
    });
  }

  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
}
