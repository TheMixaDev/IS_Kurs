import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faEdit, faPlus, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";

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
  constructor() {
  }

  ngOnInit() {
  }

  protected readonly faPlus = faPlus;
  protected readonly faStar = faStar;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
}
