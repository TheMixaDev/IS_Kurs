import {Component, OnInit} from "@angular/core";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {SprintsCalendarComponent} from "./sprints-calendar.component";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {FullCalendarModule} from "@fullcalendar/angular";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {SprintsTableComponent} from "./sprints-table.component";
import { TeamService } from "../../services/server/team.service";
import { Team } from "../../models/team";
import { SprintService } from "../../services/server/sprint.service";
import { HttpErrorResponse } from "@angular/common/http";

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
  teams: Team[] = [];
  teamOptions: { [key: string]: string } = {};
  selectedTeamId: string = '';
  selectedTeamName: string = '';

  constructor(private teamService : TeamService, private sprintService: SprintService) {}

  setView(view: boolean) {
    this.tableView = view;
    localStorage.setItem("lastView", String(view));
  }
  ngOnInit() {
    const lastView = localStorage.getItem("lastView");
    this.tableView = lastView === "true";
    const savedUser = localStorage.getItem('user');
    this.teamService.getAllTeams(false).subscribe({
      next: (teams) => {
        if (!(teams instanceof HttpErrorResponse)) {
          this.teams = teams;
          this.teamOptions = teams.reduce((acc, team) => {
            acc[team.id.toString()] = team.name;
            return acc;
          }, {} as { [key: string]: string });

          if (savedUser) {
            const user = JSON.parse(savedUser);
            this.selectedTeamId = user?.team?.id?.toString() || '';
            const selectedTeam = this.teams.find(team => team.id.toString() === this.selectedTeamId);
            this.selectedTeamName = selectedTeam?.name || '';
            console.log(this.selectedTeamId);
            this.sprintService.initiateUpdate();
        }
        }
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.teams = [];
        this.teamOptions = {};
      }
    });
    
  }

  onTeamChange(teamId: string) {
    this.selectedTeamId = teamId;
    const selectedTeam = this.teams.find(team => team.id.toString() === teamId);
    this.selectedTeamName = selectedTeam?.name || '';
    this.sprintService.initiateUpdate();
  }

  protected readonly faPlus = faPlus;
}
