import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {faClose, faPlus, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import { UiButtonComponent } from '../../../components/ui/ui-button.component';
import { IdeaService } from '../../../services/server/idea.service';
import { AlertService } from '../../../services/alert.service';
import { IdeaDto } from '../../../models/dto/idea-dto';
import { Idea } from '../../../models/idea';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {NgClass, NgIf} from "@angular/common";
import {TableCellComponent} from "../../../components/table/table-cell.component";
import {TableComponent} from "../../../components/table/table.component";
import {TableRowComponent} from "../../../components/table/table-row.component";
import {TooltipBinding} from "../../../components/bindings/tooltip.binding";
import {AuthService} from "../../../services/server/auth.service";
import {Risk} from "../../../models/risk";
import {HttpErrorResponse} from "@angular/common/http";
import {RiskService} from "../../../services/server/risk.service";
import {AddRiskModalComponent} from "../../tasks/task-view/add-risk/add-risk-modal.component";
import {ConfirmModalComponent} from "../../../components/modal/confirm-modal.component";
import {CustomValidators} from "../../../misc/custom-validators";

@Component({
  selector: 'app-create-idea-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    NgbTooltip,
    NgClass
  ],
  templateUrl: 'create-idea-modal.component.html'
})
export class CreateIdeaModalComponent implements OnInit {
  @Input() idea: Idea | null = null;
  @Input() viewMode = false;

  currentUser = this.authService.getUser();

  risks: Risk[] = [];
  availableRisks: { [key: number]: string } = {};

  createForm = new FormGroup({
    description: new FormControl('', [Validators.required, Validators.maxLength(2047), CustomValidators.noWhitespace()]),
  });

  get errors() {
    if(this.createForm.get('description')?.errors?.['required'] || this.createForm.get('description')?.errors?.['pattern'])
      return 'Не заполнено поле описание.';
    if(this.createForm.get('description')?.errors?.['maxlength'])
      return 'Длина поля описание не должна превышать 2047 символов.';
    return '';
  }

  isEditing: boolean = false;

  constructor(
    private ideaService: IdeaService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private authService: AuthService,
    private riskService: RiskService,
    private modalService: NgbModal
  ) {
    this.authService.user$.subscribe(this.loadUserData.bind(this));
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get canEditIdea() : boolean {
    return this.currentUser?.login == this.idea?.authorLogin?.login || this.isAdmin;
  }

  get canEditRisks() : boolean {
    return (this.canEditIdea && !this.viewMode) || this.isAdmin;
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  get tableColumns() : string[] {
    let baseColumns = ['Описание', 'Вероятность', 'Потери'];
    if(this.canEditRisks) baseColumns.push('Действия');
    return baseColumns;
  }

  ngOnInit() {
    if (this.idea) {
      this.isEditing = true;
      this.createForm.patchValue(this.idea);
      this.loadRisks();
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

  loadRisks() {
    if(!this.idea) return;
    this.riskService.getRisksForIdea(this.idea.id).subscribe(risks => {
      if (!(risks instanceof HttpErrorResponse)) {
        this.risks = risks;
        this.updateAvailableRisks();
      }
    })
  }

  updateAvailableRisks() {
    this.riskService.getAllRisks(0, '').subscribe(risks => {
      if (risks && !(risks instanceof HttpErrorResponse)) {
        this.availableRisks = (risks.content as Risk[]).reduce((acc: any, risk) => {
          acc[risk.id] = risk.description;
          return acc;
        }, {});
        if(this.risks) {
          this.risks.forEach(risk => {
            delete this.availableRisks[risk.id];
          })
        }
      }
    })
  }

  openAddRiskModal() {
    const modalRef = this.modalService.open(AddRiskModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.dropdown = this.availableRisks;
    modalRef.result.then(data => {
      if(data as number) {
        this.addRisk(data);
      }
    });
  }

  addRisk(riskId: number) {
    if (!this.idea) return;

    this.riskService.addRiskToIdea(this.idea.id, riskId).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Риск успешно добавлен к идее');
        this.loadRisks();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при добавлении риска к идее: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error adding risk to task:', error);
      }
    });
  }

  openDeleteModal(risk: any) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Открепить риск "${risk.description}" от идеи?`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.deleteRisk(risk.id);
      }
    });
  }

  deleteRisk(riskId: number) {
    if (!this.idea) return;
    this.riskService.removeRiskFromIdea(this.idea.id, riskId).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Риск успешно откреплен от идеи');
        this.loadRisks();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при откреплении риска от идеи: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error deleting risk from task:', error);
      }
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

  protected readonly faTrash = faTrash;
}
