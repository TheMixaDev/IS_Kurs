import {ChangeDetectorRef, Component, HostBinding, Input, OnInit} from "@angular/core";
import {AlertService} from "../../services/alert.service";
import {
  faArrowLeft,
  faArrowRight,
  faCircle,
  faEdit, faGear,
  faListCheck,
  faPlus,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import {SprintTeamDto} from "../../models/dto/sprint-team-dto";
import {SprintService} from "../../services/server/sprint.service";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DatePipe} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import { SprintsComponent } from "./sprints.component";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {initFlowbite} from "flowbite";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";

@Component({
  selector: 'app-sprints-table',
  standalone: true,
  imports: [
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    FaIconComponent,
    DatePipe,
    UiButtonComponent,
    NgbTooltip,
    TooltipBinding
  ],
  templateUrl: './sprints-table.component.html'
})
export class SprintsTableComponent implements OnInit {
  @Input() selectedTeamName : string = '';
  sprints : SprintTeamDto[] = [];
  year = new Date().getFullYear();
  constructor(private sprintService : SprintService, private alertService : AlertService) {
    this.sprintService.sprint$.subscribe(() => {
      this.update();
    });
  }
  updateSprints() {
    this.sprints = [];
    this.sprintService.getSprintsByYearAndTeam(this.year, this.selectedTeamName).subscribe(sprints => {
      if(sprints as SprintTeamDto[]) {
        this.sprints = sprints as SprintTeamDto[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о спринтах");
      }
    });
  }
  ngOnInit() {
    this.updateSprints();
    initFlowbite();
  }
  changeYear(amount : number) {
    this.year += amount;
    this.updateSprints();
  }

  update() {
    this.updateSprints();
  }

  protected readonly currentYear = new Date().getFullYear();
  protected readonly faCircle = faCircle;
  protected readonly faPlus = faPlus;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faListCheck = faListCheck;
  protected readonly faGear = faGear;
}
