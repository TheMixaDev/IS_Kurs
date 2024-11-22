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
import { AlertService } from "../../services/alert.service";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import { initFlowbite } from "flowbite";
import { Tag } from "../../models/tag";
import { TagService } from "../../services/server/tag.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { CreateTagModalComponent } from "./create-tag/create-tag-modal.component";
import {AuthService} from "../../services/server/auth.service";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-tag',
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
    FormsModule,
    NgIf,
    NgbTooltip
  ],
  templateUrl: './tag.component.html'
})
export class TagComponent implements OnInit {
  tags: Tag[] = [];
  search = '';
  currentUser = this.authService.getUser();

  initialized = false;

  constructor(private tagService: TagService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {
    this.tagService.tag$.subscribe(() => {
      this.updateTags();
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
    this.updateTags();
    initFlowbite();
  }

  updateTags(){
    this.tagService.getAllTags().subscribe(tags => {
      if(!this.initialized) {
        this.initialized = true;
        this.loaderService.loader(false);
      }
      if(tags instanceof HttpErrorResponse) return;
      this.tags = tags;
    })
  }

  openCreateModal(){
    this.modalService.open(CreateTagModalComponent, {
      size: 'lg'
    });
  }

  openEditModal(tag: Tag){
    if (tag) {
      const modalRef = this.modalService.open(CreateTagModalComponent, {
        size: 'lg'
      });
      modalRef.componentInstance.tag = tag;
    }
  }

  openDeleteModal(tag: Tag) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить тег "${tag.name}"?`;
    modalRef.componentInstance.warning = `При удалении тега, он удалится у всех задач.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.tagService.deleteTag(tag.id).subscribe({
          next: () => {
            this.updateTags();
            this.alertService.showAlert('success', 'Тег успешно удален');
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении тега: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting tag:', error);
          }
        });
      }
    });
  }


  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
}
