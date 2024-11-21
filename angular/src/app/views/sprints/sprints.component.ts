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
import { AuthService } from "../../services/server/auth.service";
import { BehaviorSubject, debounceTime, Subject, takeUntil } from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CreateSprintModalComponent} from "./create-sprint/create-sprint-modal.component";
import {NgIf} from "@angular/common";
import {LoaderService} from "../../services/loader.service";

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
    SprintsTableComponent,
    NgIf
  ],
  templateUrl: './sprints.component.html'
})
export class SprintsComponent implements OnInit {
  tableView = false;
  teams: Team[] = [];
  teamOptions: { [key: string]: string } = {};
  currentUser = this.authService.getUser();

  _selectedTeam: string = '';

  constructor(private teamService : TeamService,
              private sprintService: SprintService,
              private authService: AuthService,
              private modalService: NgbModal,
              private loaderService: LoaderService
  ) {
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.loaderService.loader(true);
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  setView(view: boolean) {
    this.tableView = view;
    localStorage.setItem("lastView", String(view));
  }

  get selectedTeam(): string {
    return this._selectedTeam;
  }

  set selectedTeam(value: string) {
    if(value !== this._selectedTeam && value != null) {
      this._selectedTeam = value;
      setTimeout(this.sprintService.initiateUpdate.bind(this.sprintService), 0);
    }
  }

  ngOnInit() {
    const lastView = localStorage.getItem("lastView");
    this.tableView = lastView === "true";

    const user = this.authService.getUser();
    this.teamService.getAllTeams(true).subscribe({
      next: (teams) => {
        if (!(teams instanceof HttpErrorResponse)) {
          this.teams = teams;
          this.teamOptions = teams.reduce((acc, team) => {
            acc[team.name] = team.name;
            return acc;
          }, {} as { [key: string]: string });

          if (user) {
            this.selectedTeam = this.teams.find(
              team => team.id.toString() === user?.team?.id?.toString() || ''
            )?.name || this.teams[0]?.name || '';
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

  protected readonly faPlus = faPlus;

  openCreateModal() {
    this.modalService.open(CreateSprintModalComponent, {
      size: 'lg'
    });
  }
}
