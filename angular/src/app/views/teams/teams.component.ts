import {Component, OnInit} from "@angular/core";
import {TableComponent} from "../../components/table/table.component";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faInfo,
  faInfoCircle,
  faPencil,
  faPlus,
  faSearch,
  faTrash,
  faWarning
} from "@fortawesome/free-solid-svg-icons";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {TeamService} from "../../services/server/team.service";
import {Team} from "../../models/team";
import {CreateTeamModalComponent} from "./create-team/create-team-modal.component";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {TeamLoadModalComponent} from "./team-load/team-load-modal.component";
import {AuthService} from "../../services/server/auth.service";

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [TableComponent, DatePipe, UiButtonComponent, FaIconComponent, ReactiveFormsModule, FormsModule, NgForOf, NgClass, PrimaryButtonBinding, UiDropdownComponent, NgIf, NgbTooltip],
  templateUrl: './teams.component.html'
})
export class TeamsComponent implements OnInit {
  teams : Team[] = [];
  search = '';
  currentUser = this.authService.getUser();
  constructor(private teamService : TeamService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {
    this.teamService.team$.subscribe(this.updateTeams.bind(this));
    this.authService.user$.subscribe(this.loadUserData.bind(this));
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  get filteredTeams() {
    return this.teams.filter(t => t.name.toLowerCase().includes(this.search.toLowerCase()) || t.description?.toLowerCase().includes(this.search.toLowerCase()));
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
    this.teamService.getAllTeams(!this.isAdmin).subscribe(teams => {
      this.teams = teams as Team[];
    });
  }

  teamClick(team: Team) {
    const modalRef = this.modalService.open(TeamLoadModalComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.team = team;
  }

  ngOnInit() {
    this.updateTeams();
  }

  protected readonly faPencil = faPencil;
  protected readonly faTrash = faTrash;
  protected readonly faPlus = faPlus;
  protected readonly faWarning = faWarning;
  protected readonly faSearch = faSearch;
  protected readonly faInfo = faInfo;
  protected readonly faInfoCircle = faInfoCircle;
}
