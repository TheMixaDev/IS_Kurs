import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {faCircle, faEdit, faGear, faListCheck, faPlus, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import {DatePipe} from "@angular/common";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import { Status } from "../../models/status";
import { StatusService } from "../../services/server/status.service";
import { AlertService } from "../../services/alert.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { initFlowbite } from "flowbite";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { CreateStatusModalComponent } from "./create-status/create-status-modal.component";

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
    UiButtonComponent
  ],
  templateUrl: './status.component.html'
})
export class StatusComponent implements OnInit {
  statuses: Status[] = [];

  constructor(private statusService: StatusService, private alertService: AlertService, private modalService: NgbModal) {
    this.statusService.status$.subscribe(() => {
      this.updateStatuses();
    });
  }

  ngOnInit() {
    this.updateStatuses();
    initFlowbite();
  }

  updateStatuses(){
    this.statuses = [];
    this.statusService.getAllStatuses().subscribe(statuses => {
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
  protected readonly faListCheck = faListCheck;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faCircle = faCircle;
  protected readonly faGear = faGear;
  protected readonly faStar = faStar;
}
