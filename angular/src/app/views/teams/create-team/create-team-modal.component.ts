import {Component, Input, OnInit} from "@angular/core";
import {faClose, faPlus, faPen} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {UiDropdownComponent} from "../../../components/ui/ui-dropdown.component";
import {TeamService} from "../../../services/server/team.service";
import {AlertService} from "../../../services/alert.service";
import {Team} from "../../../models/team";
import {UiCheckboxComponent} from "../../../components/ui/ui-checkbox.component";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {CustomValidators} from "../../../misc/custom-validators";
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [
    FaIconComponent,
    UiButtonComponent,
    ReactiveFormsModule,
    UiDropdownComponent,
    FormsModule,
    UiCheckboxComponent,
    NgClass
  ],
  templateUrl: './create-team-modal.component.html'
})
export class CreateTeamModalComponent implements OnInit {
  @Input() team: Team | null = null;

  isEditing: boolean = false;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]),
    color: new FormControl('#ffffff', [Validators.required]),
    description: new FormControl(''),
    isActive: new FormControl(true)
  })

  get errors() {
    if(this.createForm.get('name')?.errors?.['required'] || this.createForm.get('name')?.errors?.['pattern'])
      return 'Не заполнено поле название команды';
    if(this.createForm.get('name')?.errors?.['maxlength'])
      return 'Длина поля название команды не должна превышать 255 символов';
    return '';
  }

  constructor(private teamService: TeamService,
              private alertService: AlertService,
              private activeModal: NgbActiveModal) {}

  ngOnInit() {
    if (this.team) {
      this.isEditing = true;
      this.createForm.patchValue(this.team);
    }
  }

  handleSubmit() {
    if (this.createForm.valid) {
      const teamData = this.createForm.value;
      const teamEntity = teamData as Team;

      if (this.isEditing) {
        if(this.team)
          this.teamService.updateTeam(this.team.id, teamEntity).subscribe(
            team => {
              this.alertService.showAlert("success", "Команда успешно обновлена");
              this.teamService.initiateUpdate();
              this.closeModal();
            }
          );

      } else {
        this.teamService.createTeam(teamEntity).subscribe(team => {
          this.alertService.showAlert("success", "Команда успешно создана");
          this.teamService.initiateUpdate();
          this.closeModal();
        });
      }
    }
  }
  closeModal() {
    this.activeModal.close();
  }

  protected readonly faPlus = faPlus;
  protected readonly faClose = faClose;
  protected readonly faPen = faPen;

  get modalTitle() : string { return this.isEditing ? 'Редактирование команды' : 'Создание команды' }
  get submitButtonText() : string { return this.isEditing ? 'Обновить команду' : 'Создать команду' }
  get submitButtonIcon() : IconDefinition { return this.isEditing ? this.faPen : this.faPlus }
  get submitButtonColor() : string { return this.isEditing ? 'warning' : 'primary' }
}
