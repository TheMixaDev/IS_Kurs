import {Component, OnInit} from "@angular/core";
import {TableComponent} from "../../components/table/table.component";
import {DatePipe, NgClass, NgForOf} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCircle, faPencil, faPlus, faSearch, faTrash, faWarning} from "@fortawesome/free-solid-svg-icons";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TeamService} from "../../services/server/team.service";
import {Team} from "../../models/team";
import {CreateTeamModalComponent} from "./create-team/create-team-modal.component";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [TableComponent, DatePipe, UiButtonComponent, FaIconComponent, ReactiveFormsModule, FormsModule, NgForOf, NgClass, PrimaryButtonBinding, UiDropdownComponent],
  templateUrl: './teams.component.html',
  styles: `
    .search-bar {
      @apply w-full
    }
    @media (min-width: 1024px) {
      .search-bar {
        width: calc(100% - 260px);
      }
    }
  `
})
export class TeamsComponent implements OnInit {
  teams : Team[] = [];
  search = '';
  constructor(private teamService : TeamService,
              private modalService: NgbModal
  ) {
    this.teamService.team$.subscribe(this.updateTeams.bind(this));
  }

  get filteredTeams() {
    return this.teams.filter(t => t.name.includes(this.search) || t.description?.includes(this.search));
  }

  createClick() {
    const modalRef =this.modalService.open(CreateTeamModalComponent, {
      size: 'lg'
    });
    modalRef.result.then(() => {
      this.teamService.initiateUpdate();
    }).catch(() => {});
  }

  editTeam(team: Team) {
    const modalRef = this.modalService.open(CreateTeamModalComponent, {
      size: "lg",
    });
    modalRef.componentInstance.team = team;
    modalRef.result.then(() => {
      this.teamService.initiateUpdate();
    }).catch(() => {})
  }

  updateTeams() {
    this.teamService.getAllTeams(false).subscribe(teams => {
      this.teams = teams as Team[];
    });
  }

  ngOnInit() {
    this.updateTeams();
  }

  protected readonly faPencil = faPencil;
  protected readonly faTrash = faTrash;
  protected readonly faPlus = faPlus;
  protected readonly faCircle = faCircle;
  protected readonly faWarning = faWarning;
  protected readonly faSearch = faSearch;
}
