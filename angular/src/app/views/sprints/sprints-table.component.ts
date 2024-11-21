import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {AlertService} from "../../services/alert.service";
import {
  faArrowLeft,
  faArrowRight,
  faEdit, faGear,
  faListCheck,
  faPlus,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import {SprintTeamDto} from "../../models/dto/sprint-team-dto";
import {SprintService} from "../../services/server/sprint.service";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DatePipe} from "@angular/common";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {initFlowbite} from "flowbite";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {Sprint} from "../../models/sprint";
import {CreateSprintModalComponent} from "./create-sprint/create-sprint-modal.component";
import {ConfirmModalComponent} from "../../components/modal/confirm-modal.component";
import {ReleaseModalComponent} from "./release/release-modal.component";
import {Release} from "../../models/release";
import {Router} from "@angular/router";
import {AuthService} from "../../services/server/auth.service";
import {Subscription} from "rxjs";
import {LoaderService} from "../../services/loader.service";
import {LoaderComponent} from "../../components/loader.component";

@Component({
  selector: 'app-sprints-table',
  standalone: true,
  imports: [
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    FaIconComponent,
    DatePipe,
    UiButtonComponent,
    NgbTooltip,
    TooltipBinding,
    LoaderComponent
  ],
  templateUrl: './sprints-table.component.html'
})
export class SprintsTableComponent implements OnInit, OnDestroy {
  @Input() selectedTeamName : string = '';
  initialized = false;
  sprints : SprintTeamDto[] = [];
  year = new Date().getFullYear();
  currentUser = this.authService.getUser();
  sprintSubscription : Subscription;
  constructor(private sprintService : SprintService,
              private alertService : AlertService,
              private loaderService: LoaderService,
              private authService: AuthService,
              private modalService: NgbModal,
              private router: Router) {
    this.sprintSubscription = this.sprintService.sprint$.subscribe(this.updateSprints.bind(this));
    this.authService.user$.subscribe(this.loadUserData.bind(this));
  }

  _loadingData = false;

  get loadingData() : boolean {
    return this._loadingData;
  }

  set loadingData(value : boolean) {
    if(this._loadingData == value) return;
    setTimeout(() => {
      this._loadingData = value;
    }, 0);
  }

  ngOnDestroy() {
    this.sprintSubscription.unsubscribe();
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  updateSprints() {
    this.loadingData = true;
    //this.sprints = [];
    this.sprintService.getSprintsByYearAndTeam(this.year, this.selectedTeamName).subscribe(sprints => {
      if(sprints as SprintTeamDto[]) {
        this.sprints = sprints as SprintTeamDto[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о спринтах");
      }
      this.loadingData = false;
      if(!this.initialized) {
        this.initialized = true;
        this.loaderService.loader(false);
      }
    });
  }
  ngOnInit() {
    if(this.selectedTeamName != '')
      this.updateSprints();
    initFlowbite();
  }
  changeYear(amount : number) {
    if(this.year + amount <= 2030 && this.year + amount >= 2000){
      this.year += amount;
      this.updateSprints();
    }
  }

  openEditModal(sprint: SprintTeamDto) {
    this.sprintService.getSprint(sprint.sprintId).subscribe(fetched => {
      if(fetched as Sprint) {
        const modalRef = this.modalService.open(CreateSprintModalComponent, {
          size: 'lg'
        });
        modalRef.componentInstance.sprint = fetched as Sprint;
      }
    });
  }

  openDeleteModal(sprint: SprintTeamDto) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить спринт "${sprint.majorVersion}"?`;
    modalRef.componentInstance.warning = `При удалении спринта, все его релизы будут безвозвратно удалены. Назначенные задачи на спринт будут сохранены.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.sprintService.deleteSprint(sprint.sprintId).subscribe({
          next: () => {
            this.alertService.showAlert('success', 'Спринт успешно удален');
            this.updateSprints();
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении спринта: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting sprint:', error);
          }
        });
      }
    });
  }

  openReleaseModal(sprint: SprintTeamDto) {
    this.sprintService.getSprintReleases(sprint.sprintId).subscribe({
      next: (releases) => {
        const modalRef = this.modalService.open(ReleaseModalComponent, {
          size: 'lg',
          backdrop: 'static'
        });
        modalRef.componentInstance.releases = releases as Release[];
        modalRef.componentInstance.sprintId = sprint.sprintId;
        modalRef.componentInstance.sprint = sprint;
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при загрузке релизов: ' + error.message);
        console.error('Error loading releases:', error);
      }
    });
  }

  openTasksView(sprint: SprintTeamDto) {
    this.router.navigate(['tasks'], {
      queryParams: {
        sprintId: sprint.sprintId,
        sprintVersion: sprint.majorVersion
      }
    });
  }

  protected readonly currentYear = new Date().getFullYear();
  protected readonly faPlus = faPlus;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faListCheck = faListCheck;
  protected readonly faGear = faGear;
}
