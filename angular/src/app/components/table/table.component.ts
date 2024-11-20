import { Component, EventEmitter, Input, Output } from '@angular/core';
import {faArrowLeft, faArrowRight, faPlus} from '@fortawesome/free-solid-svg-icons';
import {NgForOf, NgIf} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {UiButtonComponent} from "../ui/ui-button.component";
import {PageInfo} from "../../models/misc/page";

@Component({
  selector: 'app-table-component',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [
    NgIf,
    FaIconComponent,
    NgForOf,
    UiButtonComponent
  ],
  styleUrls: ['table.component.css']
})
export class TableComponent {
  @Input() creationEnabled = false;
  @Input() creationText = 'Создать';
  @Input() columns: string[] = [];
  @Input() headerText: string | null = null;
  @Input() maxHeight: string | null = null;

  @Input() pageInfo: PageInfo | null = null;

  @Output() creationClick = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  faPlus = faPlus;

  currentPage = 0;

  ngOnChanges() {
    if (this.pageInfo) {
      this.currentPage = this.pageInfo.number;
    }
  }


  changePage(newPage: number | string) {
    if(typeof newPage === 'string') return;
    newPage = Number(newPage);
    if (newPage >= 0 && newPage < this.pageInfo!.totalPages) {
      this.currentPage = newPage;
      this.pageChange.emit(this.currentPage);
    }
  }

  addOne(page: number | string) : string {
    if(typeof page === 'string') return page;
    page = Number(page);
    return (page + 1).toString();
  }

  get pages(): (number | string)[] {
    if (!this.pageInfo) {
      return [];
    }

    const totalPages = this.pageInfo.totalPages - 1;

    if (totalPages <= 4) {
      return Array.from({ length: totalPages + 1 }, (_, i) => i);
    }

    const currentPage = this.currentPage;
    const pages: (number | string)[] = [];

    pages.push(0);
    if(currentPage + 1 > 2)
      pages.push('...');

    let start = currentPage;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = 2;
    }
    if (end >= totalPages) {
      start = totalPages - 3;
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if(currentPage + 1 < totalPages - 2)
      pages.push('...');
    if(!pages.includes(totalPages))
      pages.push(totalPages);

    return pages;
  }

  protected readonly Math = Math;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
