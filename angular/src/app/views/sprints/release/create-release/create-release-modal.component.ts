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

@Component({
  selector: 'app-create-release-modal',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent, FaIconComponent, FormsModule],
  templateUrl: './create-release-modal.component.html'
})
export class CreateReleaseModalComponent implements OnInit {
  @Input() release: Release | null = null;
  @Input() sprintId: number | null = null;

  isEditing: boolean = false;

  createForm = new FormGroup({
    version: new FormControl('', [Validators.required]),
    releaseDate: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

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
    if (this.createForm.valid && this.sprintId) {
      const releaseData = this.createForm.value as ReleaseDto;
      releaseData.sprintId = this.sprintId;
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
