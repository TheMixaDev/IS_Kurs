import {Component, HostBinding, OnInit} from "@angular/core";
import {AlertService} from "../../services/alert.service";
import {faArrowLeft, faArrowRight, faCircle, faPlus} from "@fortawesome/free-solid-svg-icons";
import {SprintTeamDto} from "../../models/dto/sprint-team-dto";
import {SprintService} from "../../services/server/sprint.service";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DatePipe} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";

@Component({
  selector: 'app-sprints-table',
  standalone: true,
  imports: [
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    FaIconComponent,
    DatePipe,
    UiButtonComponent
  ],
  templateUrl: './sprints-table.component.html'
})
export class SprintsTableComponent implements OnInit {
  sprints : SprintTeamDto[] = [];
  year = new Date().getFullYear();
  constructor(private sprintService : SprintService, private alertService : AlertService) {
    this.sprintService.sprint$.subscribe(this.updateSprints.bind(this));
  }
  updateSprints() {
    this.sprints = [];
    this.sprintService.getSprintsByYearAndTeam(this.year, "API").subscribe(sprints => {
      if(sprints as SprintTeamDto[]) {
        this.sprints = sprints as SprintTeamDto[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о спринтах");
      }
    });
  }
  ngOnInit() {
    this.updateSprints();
  }
  changeYear(amount : number) {
    this.year += amount;
    this.updateSprints();
  }

  protected readonly currentYear = new Date().getFullYear();
  protected readonly faCircle = faCircle;
  protected readonly faPlus = faPlus;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
