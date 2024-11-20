import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {faCircle, faEdit, faGear, faListCheck, faPlus, faStar, faTrash, faSearch} from "@fortawesome/free-solid-svg-icons";
import {DatePipe} from "@angular/common";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import { AlertService } from "../../services/alert.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { initFlowbite } from "flowbite";
import { Tag } from "../../models/tag";
import { TagService } from "../../services/server/tag.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { CreateTagModalComponent } from "./create-tag/create-tag-modal.component";

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
    FormsModule
  ],
  templateUrl: './tag.component.html'
})
export class TagComponent implements OnInit {
  tags: Tag[] = [];
  search = '';
  currentPage: number = 0;

  constructor(private tagService: TagService, private alertService: AlertService, private modalService: NgbModal) {
    this.tagService.tag$.subscribe(() => {
      this.updateTags();
    });
  }

  ngOnInit() {
    this.updateTags();
    initFlowbite();
  }

  updateTags(){
    this.tagService.getAllTags().subscribe(tags => {
        if(tags instanceof HttpErrorResponse) return;
        this.tags = tags;
      })
  }

  searchChange() {
    this.updateTags();
    this.currentPage = 0;
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateTags();
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
    const modalRef = this.modalService.open(CreateTagModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить тег "${tag.name}"?`;
    modalRef.componentInstance.warning = `При удалении риска, он удалится у всех задач.`;
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
  protected readonly faListCheck = faListCheck;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faCircle = faCircle;
  protected readonly faGear = faGear;
  protected readonly faStar = faStar;
  protected readonly faSearch = faSearch;
}
