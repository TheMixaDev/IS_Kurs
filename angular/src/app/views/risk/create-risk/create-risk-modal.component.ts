import { Component, Input, OnInit } from "@angular/core";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { UiButtonComponent } from "../../../components/ui/ui-button.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { UiDropdownComponent } from "../../../components/ui/ui-dropdown.component";
import { Risk } from "../../../models/risk";
import { RiskService } from "../../../services/server/risk.service";
import { AlertService } from "../../../services/alert.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { RiskDto } from "../../../models/dto/risk-dto";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faClose, faPlus, faPen } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-create-risk-modal',
    standalone: true,
    imports: [
      FaIconComponent,
      UiButtonComponent,
      ReactiveFormsModule,
      UiDropdownComponent,
      FormsModule],
      templateUrl: './create-risk-modal.component.html'
})
export class CreateRiskModalComponent implements OnInit{
  @Input() risk: Risk | null = null;

  createForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    probability: new FormControl('', [Validators.required]),
    estimatedLoss: new FormControl('', [Validators.required]),
  });

  isEditing: boolean = false;

  constructor(
    private riskService: RiskService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.risk) {
      this.isEditing = true;
      this.createForm.patchValue({
        description: this.risk.description,
        probability: this.risk.probability.toString(),
        estimatedLoss: this.risk.estimatedLoss.toString(),
      });
    }
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const riskData: RiskDto = {
        description: formValue.description ?? '',
        probability: Number(formValue.probability),
        estimatedLoss: Number(formValue.estimatedLoss)
      };
      if (this.isEditing) {
        this.updateRisk(riskData);
      } else {
        this.createRisk(riskData);
      }
    }
  }

  createRisk(riskData: RiskDto) {
    this.riskService.createRisk(riskData).subscribe(() => {
      this.alertService.showAlert('success', 'Риск успешно создан');
      this.riskService.initiateUpdate();
      this.closeModal();
    });
  }

  updateRisk(riskData: RiskDto) {
    if(this.risk)
      this.riskService.updateRisk(this.risk.id, riskData).subscribe(() => {
        this.alertService.showAlert('success', 'Риск успешно обновлен');
        this.riskService.initiateUpdate();
        this.closeModal();
      });
  }



  closeModal() {
    this.activeModal.close();
  }


  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faClose = faClose;

  get modalTitle() : string { return this.isEditing ? 'Редактирование риска' : 'Создание риска' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить риск' : 'Создать риск' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }

}