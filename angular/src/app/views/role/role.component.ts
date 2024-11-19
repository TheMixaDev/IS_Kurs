import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faEdit, faPlus, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { RoleService } from "../../services/server/role.service";
import { Role } from "../../models/role";
import { AlertService } from "../../services/alert.service";
import { initFlowbite } from "flowbite";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CreateRoleModalComponent } from "./create-role/create-role-modal.component";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [
    FaIconComponent,
    PrimaryButtonBinding,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent
  ],
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {
  

  roles: Role[] = [];

  constructor(private roleService: RoleService, private alertService: AlertService, private modalService: NgbModal) {
    this.roleService.role$.subscribe(() => {
      this.updateRoles();
    });
  }

  ngOnInit() {
    this.updateRoles();
    initFlowbite();
  }

  updateRoles(){
    this.roles = [];
    this.roleService.getAllRoles().subscribe(sprints => {
      if(sprints as Role[]) {
        this.roles = sprints as Role[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о ролях");
      }
    });
  }

  openCreateModal() {
    this.modalService.open(CreateRoleModalComponent, {
      size: 'lg'
    });
  }

  openEditModal(role: Role) {
    if (role) {
      const modalRef = this.modalService.open(CreateRoleModalComponent, {
        size: 'lg'
      });
      modalRef.componentInstance.role = role;
    }
  }

  openDeleteModal(role: Role) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить роль "${role.name}"?`;
    modalRef.componentInstance.warning = `При удалении роли, она удалится у всех людей.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.alertService.showAlert('success', 'Роль успешно удалена');
            this.updateRoles();
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении роли: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting sprint:', error);
          }
        });
      }
    });
  }

  // TODO: Доделать редактирование статусов для роли 

  protected readonly faPlus = faPlus;
  protected readonly faStar = faStar;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
}
