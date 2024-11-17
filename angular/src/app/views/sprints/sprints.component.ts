import {Component, OnInit} from "@angular/core";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {SprintsCalendarComponent} from "./sprints-calendar.component";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {FullCalendarModule} from "@fullcalendar/angular";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {SprintsTableComponent} from "./sprints-table.component";

@Component({
  selector: 'app-sprints',
  standalone: true,
  imports: [
    HeaderItemBinding,
    SprintsCalendarComponent,
    UiDropdownComponent,
    FullCalendarModule,
    PrimaryButtonBinding,
    FaIconComponent,
    SprintsTableComponent
  ],
  templateUrl: './sprints.component.html'
})
export class SprintsComponent implements OnInit {
  tableView = false;
  setView(view: boolean) {
    this.tableView = view;
    localStorage.setItem("lastView", String(view));
  }
  ngOnInit() {
    const lastView = localStorage.getItem("lastView");
    this.tableView = lastView === "true";
  }

  protected readonly faPlus = faPlus;
}
