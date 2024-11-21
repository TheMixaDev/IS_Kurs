import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faClose, faPlus, faPen} from "@fortawesome/free-solid-svg-icons";
import {FormsModule} from "@angular/forms";
import {UiButtonComponent} from "../../../../components/ui/ui-button.component";
import {ReleaseService} from "../../../../services/server/release.service";
import {AlertService} from "../../../../services/alert.service";
import {ReleaseDto} from "../../../../models/dto/release-dto";
import {Release} from "../../../../models/release";
import {SprintDto} from "../../../../models/dto/sprint-dto";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {CustomValidators} from "../../../../misc/custom-validators";
import {NgClass} from "@angular/common";
import {Sprint} from "../../../../models/sprint";
import {SprintTeamDto} from "../../../../models/dto/sprint-team-dto";
import moment from "moment";

@Component({
  selector: 'app-create-release-modal',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent, FaIconComponent, FormsModule, NgClass],
  templateUrl: './create-release-modal.component.html'
})
export class CreateReleaseModalComponent implements OnInit {
  @Input() release: Release | null = null;
  @Input() sprint: SprintTeamDto | null = null;

  isEditing: boolean = false;

  createForm = new FormGroup({
    version: new FormControl('', [Validators.required, Validators.maxLength(30), CustomValidators.noWhitespace()]),
    releaseDate: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  get errors() {
    if(this.createForm.get('version')?.errors?.['required'] || this.createForm.get('version')?.errors?.['pattern'])
      return 'Не заполнено поле версия.';
    if(this.createForm.get('version')?.errors?.['maxlength'])
      return 'Длина поля версия не должна превышать 30 символов.';
    if(this.createForm.get('releaseDate')?.errors?.['required'])
      return 'Не заполнено поле дата релиза.';
    if(this.invalidDates)
      return this.invalidDates;
    return '';
  }

  get invalidDatesBoolean() {
    return this.invalidDates !== false;
  }

  get invalidDates() {
    const releaseDate = this.createForm.get('releaseDate')?.value;
    if(releaseDate) {
      let currentYear = moment().toDate().getUTCFullYear();
      let releaseDateMoment = moment(releaseDate).toDate();
      let releaseYear = releaseDateMoment.getUTCFullYear();
      if(!releaseYear)
        return 'Указаны неверные даты.';
      if(releaseYear > currentYear + 5)
        return 'Дата релиза не может быть больше текущего года на 5 лет.';
      if(releaseYear < currentYear - 5)
        return 'Дата релиза не может быть меньше текущего года на 5 лет.';
      let startDateMoment = moment(this.sprint?.startDate).toDate();
      let endDateMoment = moment(this.sprint?.endDate).toDate();
      if(startDateMoment && endDateMoment) {
        if(releaseDateMoment < startDateMoment)
          return 'Дата релиза не может быть меньше даты начала спринта (' +  moment(startDateMoment).format('DD.MM.YYYY') + ').';
        if(releaseDateMoment > endDateMoment)
          return 'Дата релиза не может быть больше даты окончания спринта (' +  moment(endDateMoment).format('DD.MM.YYYY') + ').';
      }
      return false;
    }
    return 'Не введена дата релиза.';
  }

  faClose = faClose;
  faPlus = faPlus;
  faPen = faPen;


  constructor(
    private releaseService: ReleaseService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.release) {
      this.isEditing = true;
      this.createForm.patchValue(this.release);
    }
  }

  handleSubmit() {
    if (this.createForm.valid && this.sprint) {
      const releaseData = this.createForm.value as ReleaseDto;
      releaseData.sprintId = this.sprint.sprintId;
      if (this.isEditing) {
        this.updateRelease(releaseData);
      } else {
        this.createRelease(releaseData);
      }
    }
  }

  createRelease(releaseData: ReleaseDto) {
    this.releaseService.createRelease(releaseData).subscribe(() => {
      this.alertService.showAlert('success', 'Релиз успешно создан');
      this.closeModal();
    });
  }

  updateRelease(releaseData: ReleaseDto) {
    if(this.release)
      this.releaseService.updateRelease(this.release.id, releaseData).subscribe(() => {
        this.alertService.showAlert('success', 'Релиз успешно обновлен');
        this.closeModal();
      });
  }

  closeModal() {
    this.activeModal.close('create');
  }

  get modalTitle() : string { return this.isEditing ? 'Редактирование релиза' : 'Создание релиза' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить релиз' : 'Создать релиз' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }
}
