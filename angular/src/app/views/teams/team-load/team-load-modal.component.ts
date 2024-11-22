import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import {UiDropdownComponent} from "../../../components/ui/ui-dropdown.component";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {Team} from "../../../models/team";
import {SprintService} from "../../../services/server/sprint.service";
import {HttpErrorResponse} from "@angular/common/http";
import {Sprint} from "../../../models/sprint";
import {TeamService} from "../../../services/server/team.service";
import {ObjectDto} from "../../../models/dto/object-dto";
import {TableComponent} from "../../../components/table/table.component";
import {UserStoryPointsDto} from "../../../models/dto/user-story-points-dto";
import {TableRowComponent} from "../../../components/table/table-row.component";
import {TableCellComponent} from "../../../components/table/table-cell.component";

@Component({
  selector: 'app-team-load-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    ReactiveFormsModule,
    FormsModule,
    UiDropdownComponent,
    UiButtonComponent,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
  ],
  templateUrl: 'team-load-modal.component.html'
})
export class TeamLoadModalComponent {
  @Input() team: Team | null = null;

  sprints: { [key: number]: string } = {};
  sprintsLoad: boolean = false;

  result: number | null = null;
  resultLoad: boolean = false;
  userStoryPoints: UserStoryPointsDto[] = [];

  _selectedSprintId: number | null = null;

  get selectedSprintId() {
    return this._selectedSprintId;
  }
  set selectedSprintId(value) {
    this._selectedSprintId = value;
    this.updateLoad();
  }


  constructor(
    private activeModal: NgbActiveModal,
    private sprintService: SprintService,
    private teamService: TeamService
  ) {}

  loadSprints(sprint: string) {
    if(sprint.length < 1) {
      this.sprints = {};
      return;
    }
    this.sprintsLoad = true;
    this.sprintService.getAllSprints(0, sprint, this.team?.id).subscribe(sprints => {
      this.sprintsLoad = false;
      if(!(sprints instanceof HttpErrorResponse)) {
        this.sprints = (sprints.content as Sprint[]).reduce((acc: any, sprint) => {
          acc[sprint.id] = sprint.majorVersion;
          return acc;
        }, {});
      }
    })
  }

  updateLoad() {
    if(this.selectedSprintId === null || this.selectedSprintId < 1) {
      this.result = null;
      this.userStoryPoints = [];
      return;
    }
    this.resultLoad = true;
    this.teamService.getTeamLoad(this.team?.id as number, this.selectedSprintId as number).subscribe(result => {
      this.result = (result as ObjectDto).result;
      this.sprintService.getStoryPointsPerUser(this.selectedSprintId as number).subscribe(userStoryPoints => {
        this.userStoryPoints = userStoryPoints as UserStoryPointsDto[];
        this.resultLoad = false;
      })
    })
  }

  closeModal(result : number | null) {
    this.activeModal.close(result);
  }

  protected readonly faClose = faClose;
}
