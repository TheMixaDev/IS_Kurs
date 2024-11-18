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
  constructor() {
  }

  ngOnInit() {
  }

  protected readonly faPlus = faPlus;
  protected readonly faListCheck = faListCheck;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faCircle = faCircle;
  protected readonly faGear = faGear;
  protected readonly faStar = faStar;
}
