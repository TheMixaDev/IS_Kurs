import {Component, OnInit} from "@angular/core";
import {TableComponent} from "../../components/table/table.component";
import {DatePipe, NgClass, NgForOf} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCircle, faPencil, faPlus, faTrash, faWarning} from "@fortawesome/free-solid-svg-icons";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TeamService} from "../../services/server/team.service";
import {Team} from "../../models/team";
import {CreateTeamModalComponent} from "./create-team/create-team-modal.component";

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [TableComponent, DatePipe, UiButtonComponent, FaIconComponent, ReactiveFormsModule, FormsModule, NgForOf, NgClass],
  templateUrl: './teams.component.html'
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
}
