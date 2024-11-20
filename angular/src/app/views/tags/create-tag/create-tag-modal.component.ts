import { Component, OnInit, Input } from '@angular/core';
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { AlertService } from '../../../services/alert.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Tag } from '../../../models/tag';
import { TagService } from '../../../services/server/tag.service';
import { TagDto } from '../../../models/dto/tag-dto';


@Component({
  selector: 'app-create-tag-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './create-tag-modal.component.html'
})
export class CreateTagModalComponent implements OnInit {
  @Input() tag: Tag | null = null;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  isEditing: boolean = false;

  constructor(
    private tagService: TagService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.tag) {
      this.isEditing = true;
      this.createForm.patchValue({
        name: this.tag.name,
        description: this.tag.description,
      });
    }
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const tagData = this.createForm.value as TagDto;
      if (this.isEditing) {
        this.updateStatus(tagData);
      } else {
        this.createStatus(tagData);
      }
    }
  }

  createStatus(tagData: TagDto) {
    this.tagService.createTag(tagData).subscribe(() => {
      this.alertService.showAlert('success', 'Тег успешно создан');
      this.tagService.initiateUpdate();
      this.closeModal();
    });
  }

  updateStatus(tagData: TagDto) {
    if(this.tag) {
      this.tagService.updateTag(this.tag.id, tagData).subscribe(() => {
        this.alertService.showAlert('success', 'Тег успешно обновлен');
        this.tagService.initiateUpdate();
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle(): string { return this.isEditing ? 'Редактирование тега' : 'Создание тега' }
  get submitButtonText(): string { return this.isEditing ? 'Обновить тег' : 'Создать тег' }
  get submitButtonIcon(): IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor(): string { return this.isEditing ? 'warning' : 'primary' }
}