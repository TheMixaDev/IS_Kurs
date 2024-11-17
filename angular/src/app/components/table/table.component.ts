import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import {NgForOf, NgIf} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-table-component',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [
    NgIf,
    FaIconComponent,
    NgForOf
  ],
  styleUrls: ['table.component.css']
})
export class TableComponent {
  @Input() creationEnabled = true;
  @Input() clearEnabled = false;
  @Input() clearState = true;
  @Input() columns: string[] = [];
  @Input() emptyText = 'Данные не найдены';
  @Input() empty = false;

  @Output() creationClick = new EventEmitter<void>();
  @Output() clearClick = new EventEmitter<void>();
  @Output() psProceed = new EventEmitter<void>();

  faTrash = faTrash;
  faPlus = faPlus;
}
