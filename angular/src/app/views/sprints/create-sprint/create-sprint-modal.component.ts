import { Component, OnInit, Input } from '@angular/core';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { UiDropdownComponent } from '../../../components/ui/ui-dropdown.component';
import { SprintService } from '../../../services/server/sprint.service';
import { TeamService } from '../../../services/server/team.service';
import { AlertService } from '../../../services/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SprintDto } from '../../../models/dto/sprint-dto';
import { Team } from '../../../models/team';
import { Sprint } from '../../../models/sprint';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";


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
  @Input() sprint: Sprint | null = null;

  teams: any = {};
  createForm = new FormGroup({
    majorVersion: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    regressionStart: new FormControl('', [Validators.required]),
    regressionEnd: new FormControl('', [Validators.required]),
    teamId: new FormControl(0, [Validators.required])
  });

  isEditing: boolean = false;

  constructor(
    private sprintService: SprintService,
    private teamService: TeamService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.loadTeams();

    if (this.sprint) {
      this.isEditing = true;
      this.createForm.patchValue({
        majorVersion: this.sprint.majorVersion,
        startDate: this.sprint.startDate,
        endDate: this.sprint.endDate,
        regressionStart: this.sprint.regressionStart,
        regressionEnd: this.sprint.regressionEnd,
        teamId: this.sprint.team.id
      });
    }
  }

  loadTeams() {
    this.teamService.getAllTeams(true).subscribe(teams => {
      if (teams as Team[]) {
        this.teams = (teams as Team[]).reduce((acc: any, team) => {
          acc[team.id] = team.name;
          return acc;
        }, {});
      } else {
        this.teams = {};
      }
    });
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const sprintData = this.createForm.value as SprintDto;
      if (this.isEditing) {
        this.updateSprint(sprintData);
      } else {
        this.createSprint(sprintData);
      }
    }
  }


  createSprint(sprintData: SprintDto) {
    this.sprintService.createSprint(sprintData).subscribe(() => {
      this.alertService.showAlert('success', 'Спринт успешно создан');
      this.sprintService.initiateUpdate();
      this.closeModal();
    });
  }

  updateSprint(sprintData: SprintDto) {
    if(this.sprint)
      this.sprintService.updateSprint(this.sprint.id, sprintData).subscribe(() => {
        this.alertService.showAlert('success', 'Спринт успешно обновлен');
        this.sprintService.initiateUpdate();
        this.closeModal();
      });
  }



  closeModal() {
    this.activeModal.close();
  }


  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle() : string { return this.isEditing ? 'Редактирование спринта' : 'Создание спринта' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить спринт' : 'Создать спринт' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }
}
