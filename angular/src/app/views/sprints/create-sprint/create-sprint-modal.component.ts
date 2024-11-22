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
import {CustomValidators} from "../../../misc/custom-validators";
import moment from "moment";
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-create-sprint-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    UiDropdownComponent,
    FormsModule,
    NgClass
  ],
  templateUrl: './create-sprint-modal.component.html'
})
export class CreateSprintModalComponent implements OnInit {
  @Input() sprint: Sprint | null = null;

  teams: any = {};
  createForm = new FormGroup({
    majorVersion: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    regressionStart: new FormControl('', [Validators.required]),
    regressionEnd: new FormControl('', [Validators.required]),
    teamId: new FormControl(0, [Validators.required, Validators.min(1)])
  });

  get errors() {
    if(this.createForm.get('majorVersion')?.errors?.['required'] || this.createForm.get('majorVersion')?.errors?.['pattern'])
      return 'Не заполнено поле версии.';
    if(this.createForm.get('majorVersion')?.errors?.['maxlength'])
      return 'Длина поля версии не должна превышать 255 символов.';
    if(this.createForm.get('startDate')?.errors?.['required'])
      return 'Не заполнено поле даты начала разработки.';
    if(this.createForm.get('endDate')?.errors?.['required'])
      return 'Не заполнено поле даты окончания разработки.';
    if(this.createForm.get('regressionStart')?.errors?.['required'])
      return 'Не заполнено поле даты начала регресса.';
    if(this.createForm.get('regressionEnd')?.errors?.['required'])
      return 'Не заполнено поле даты окончания регресса.';
    if(this.createForm.get('teamId')?.errors?.['required'] || this.createForm.get('teamId')?.errors?.['min'])
      return 'Не заполнено поле команды.';
    if(this.invalidDates)
      return this.invalidDates;
    return '';
  }

  get invalidDates() {
    const startDate = this.createForm.get('startDate')?.value;
    const endDate = this.createForm.get('endDate')?.value;
    const regressionStart = this.createForm.get('regressionStart')?.value;
    const regressionEnd = this.createForm.get('regressionEnd')?.value;
    if(startDate && endDate && regressionStart && regressionEnd) {
      if(startDate > endDate)
        return 'Дата начала должна быть меньше даты окончания.';
      if(regressionStart > regressionEnd)
        return 'Дата начала регресса должна быть меньше даты окончания регресса.';
      if(regressionStart < startDate)
        return 'Дата начала регресса должна быть больше даты начала спринта.';
      let currentYear = moment().toDate().getUTCFullYear();
      let startYear = moment(startDate).toDate().getUTCFullYear();
      let endYear = moment(endDate).toDate().getUTCFullYear();
      let regressionStartYear = moment(regressionStart).toDate().getUTCFullYear();
      let regressionEndYear = moment(regressionEnd).toDate().getUTCFullYear();
      if(!startYear || !endYear || !regressionStartYear || !regressionEndYear)
        return 'Указаны неверные даты.';
      if(Math.abs(startYear - endYear) > 1)
        return 'Спринт не может быть растянут более чем на 2 года.';
      if(Math.abs(regressionStartYear - regressionEndYear) > 1)
        return 'Регресс не может быть растянут более чем на 2 года.';
      if(startYear > currentYear + 5)
        return 'Дата начала не может быть больше текущего года на 5 лет.';
      if(startYear < currentYear - 5)
        return 'Дата начала не может быть меньше текущего года на 5 лет.';
      if(endYear > currentYear + 5)
        return 'Дата окончания не может быть больше текущего года на 5 лет.';
      if(endYear < currentYear - 5)
        return 'Дата окончания не может быть меньше текущего года на 5 лет.';
      if(regressionStartYear > currentYear + 5)
        return 'Дата начала регресса не может быть больше текущего года на 5 лет.';
      if(regressionStartYear < currentYear - 5)
        return 'Дата начала регресса не может быть меньше текущего года на 5 лет.';
      if(regressionEndYear > currentYear + 5)
        return 'Дата окончания регресса не может быть больше текущего года на 5 лет.';
      if(regressionEndYear < currentYear - 5)
        return 'Дата окончания регресса не может быть меньше текущего года на 5 лет.';
      return false;
    }
    return 'Введены не все даты.';
  }

  get invalidDatesBoolean() : boolean {
    return this.invalidDates !== false;
  }
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
