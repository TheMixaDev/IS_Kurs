import {Component, OnInit} from "@angular/core";
import {faClose, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UiButtonComponent} from "../../ui/ui-button.component";
import {UiDropdownComponent} from "../../ui/ui-dropdown.component";
import {SprintService} from "../../../services/server/sprint.service";
import {TeamService} from "../../../services/server/team.service";
import {AlertService} from "../../../services/alert.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SprintDto} from "../../../models/dto/sprint-dto";
import {Team} from "../../../models/team";


@Component({
  selector: 'app-create-sprint-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    UiDropdownComponent,
    FormsModule
  ],
  templateUrl: './create-sprint-modal.component.html'
})
export class CreateSprintModalComponent implements OnInit {
  team = '';
  teams : any = {};
  createForm = new FormGroup({
    majorVersion: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    regressionStart: new FormControl('', [Validators.required]),
    regressionEnd: new FormControl('', [Validators.required]),
    teamId: new FormControl(0, [Validators.required])
  })
  constructor(private sprintService: SprintService,
              private teamService: TeamService,
              private alertService: AlertService,
              private activeModal: NgbActiveModal) {}
  handleSubmit() {
    if (this.createForm.valid) {
      const sprintData = this.createForm.value;

      this.sprintService.createSprint(sprintData as SprintDto).subscribe(() => {
        this.alertService.showAlert("success", "Спринт успешно создан");
        this.sprintService.initiateUpdate();
        this.closeModal();
      });
    }
  }
  closeModal() {
    this.activeModal.close();
  }
  ngOnInit() {
    this.teamService.getAllTeams(true).subscribe(teams => {
      if(teams as Team[]) {
        this.teams = (teams as Team[]).reduce((acc : any, team) => {
          acc[team.id] = team.name;
          return acc;
        }, {});
      } else {
        this.teams = {};
      }
    })
  }

  protected readonly faPlus = faPlus;
  protected readonly faClose = faClose;
}
