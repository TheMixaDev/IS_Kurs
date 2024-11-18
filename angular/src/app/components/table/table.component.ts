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
  @Input() columns: string[] = [];
  @Input() headerText: string | null = null;

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


  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.pageInfo!.totalPages) {
      this.currentPage = newPage;
      this.pageChange.emit(this.currentPage);
    }
  }

  get pages(): number[] {
    if (!this.pageInfo) {
      return [];
    }
    const pageNumbers = [];
    for (let i = 0; i < this.pageInfo.totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  protected readonly Math = Math;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
