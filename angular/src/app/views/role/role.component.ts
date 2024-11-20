import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faChartSimple, faEdit, faPlus, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { RoleService } from "../../services/server/role.service";
import { Role } from "../../models/role";
import { AlertService } from "../../services/alert.service";
import { initFlowbite } from "flowbite";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CreateRoleModalComponent } from "./create-role/create-role-modal.component";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import {RoleStatusesModalComponent} from "./statuses/role-statuses-modal.component";
import {AuthService} from "../../services/server/auth.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    FaIconComponent,
    PrimaryButtonBinding,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent,
    NgIf
  ],
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {

  roles: Role[] = [];
  currentUser = this.authService.getUser();

  constructor(private roleService: RoleService,
              private alertService: AlertService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {
    this.roleService.role$.subscribe(() => {
      this.updateRoles();
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  ngOnInit() {
    this.updateRoles();
    initFlowbite();
  }

  updateRoles(){
    this.roles = [];
    this.roleService.getAllRoles().subscribe(roles => {
      if(roles as Role[]) {
        this.roles = roles as Role[];
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
    modalRef.componentInstance.warning = `При удалении роли, она удалится у всех пользователей.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.alertService.showAlert('success', 'Роль успешно удалена');
            this.updateRoles();
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении роли: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting role:', error);
          }
        });
      }
    });
  }

  openStatusesModal(role: Role) {
    const modalRef = this.modalService.open(RoleStatusesModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.role = role;
  }

  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faChartSimple = faChartSimple;
}
