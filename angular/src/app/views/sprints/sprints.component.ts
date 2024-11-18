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
  private _selectedTeamName = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  constructor(private teamService : TeamService,
              private sprintService: SprintService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {}

  setView(view: boolean) {
    this.tableView = view;
    localStorage.setItem("lastView", String(view));
  }

  get selectedTeamName(): string {
    return this._selectedTeamName.value;
  }

  set selectedTeamName(value: string) {
    this._selectedTeamName.next(value);
  }

  ngOnInit() {
    const lastView = localStorage.getItem("lastView");
    this.tableView = lastView === "true";

    this._selectedTeamName.pipe(
      debounceTime(0),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sprintService.initiateUpdate();
    });

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
            this.selectedTeamName = this.teams.find(
              team => team.id.toString() === user?.team?.id?.toString() || ''
            )?.name || '';
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly faPlus = faPlus;

  openCreateModal() {
    this.modalService.open(CreateSprintModalComponent, {
      size: 'lg'
    });
  }
}
