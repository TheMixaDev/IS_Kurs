import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { IdeaService } from '../../../services/server/idea.service';
import { AlertService } from '../../../services/alert.service';
import { IdeaDto } from '../../../models/dto/idea-dto';
import { Idea } from '../../../models/idea';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";

@Component({
  selector: 'app-create-idea-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: 'create-idea-modal.component.html'
})
export class CreateIdeaModalComponent implements OnInit {
  @Input() idea: Idea | null = null;

  createForm = new FormGroup({
    description: new FormControl('', [Validators.required])
  });

  isEditing: boolean = false;

  constructor(
    private ideaService: IdeaService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.idea) {
      this.isEditing = true;
      this.createForm.patchValue(this.idea);
    }
  }


  handleSubmit() {
    if (this.createForm.valid) {
      const ideaData = this.createForm.value as IdeaDto;
      if (this.isEditing) {
        this.updateIdea(ideaData);
      } else {
        this.createIdea(ideaData);
      }
    }
  }

  createIdea(ideaData: IdeaDto) {
    this.ideaService.createIdea(ideaData).subscribe(() => {
      this.alertService.showAlert('success', 'Идея успешно создана');
      this.ideaService.initiateUpdate();
      this.closeModal();
    });
  }

  updateIdea(ideaData: IdeaDto) {
    if (this.idea)
      this.ideaService.updateIdea(this.idea.id, ideaData).subscribe(() => {
        this.alertService.showAlert('success', 'Идея успешно обновлена');
        this.ideaService.initiateUpdate();
        this.closeModal();
      });
  }

  closeModal() {
    this.activeModal.close();
  }

  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle() : string { return this.isEditing ? 'Редактирование идеи' : 'Создание идеи' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить идею' : 'Создать идею' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }
}
