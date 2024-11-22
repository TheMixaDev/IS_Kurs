import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {HeaderItemBinding} from "../../components/bindings/header-item.binding";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {faCheck, faEdit, faEye, faPlus, faRotateLeft, faTimes} from "@fortawesome/free-solid-svg-icons";
import {DatePipe} from "@angular/common";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {Page} from "../../models/misc/page";
import {Idea, IdeaStatus} from "../../models/idea";
import {IdeaService} from "../../services/server/idea.service";
import {HttpErrorResponse} from "@angular/common/http";
import {StatusParserPipe} from "../../pipe/status-parser.pipe";
import {User} from "../../models/user";
import {AuthService} from "../../services/server/auth.service";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {CreateIdeaModalComponent} from "./create-idea/create-idea-modal.component";
import {AlertService} from "../../services/alert.service";
import {Router} from "@angular/router";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-idea',
  standalone: true,
  imports: [
    FaIconComponent,
    HeaderItemBinding,
    PrimaryButtonBinding,
    UiDropdownComponent,
    DatePipe,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent,
    StatusParserPipe,
    NgbTooltip
  ],
  templateUrl: './idea.component.html'
})
export class IdeaComponent implements OnInit {
  ideas: Page<Idea> | null = null;
  currentPage: number = 0;
  user: User | null = null;

  initialized = false;

  statusMap: { [key: string]: string } = {
    'APPROVED': 'Принята',
    'PENDING': 'Ожидает',
    'REJECTED': 'Отклонена',
  };
  _selectedStatus: string | null = 'PENDING';

  get selectedStatus() {
    return this._selectedStatus;
  }
  set selectedStatus(value) {
    this._selectedStatus = value;
    this.currentPage = 0;
    this.updateIdeas();
  }

  constructor(private ideaService: IdeaService,
              private authService: AuthService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private modalService: NgbModal,
              private router: Router
  ) {
    this.ideaService.idea$.subscribe(() => {
      this.updateIdeas();
    })
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.loaderService.loader(true);
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

  ngOnInit() {
    this.loadUserData();
    this.updateIdeas();
  }

  loadUserData() {
    this.user = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.user && this.user.role && this.user.role.id === 1 || false;
  }

  updateIdeas() {
    this.loadingData = true;
    this.ideaService.getAllIdeas(this.currentPage, this.selectedStatus).subscribe(ideas => {
      this.loadingData = false;
      if(!this.initialized) {
        this.initialized = true;
        this.loaderService.loader(false);
      }
      if(ideas instanceof HttpErrorResponse) return;
      this.ideas = ideas;
    })
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateIdeas();
  }

  createIdea() {
    const modalRef = this.modalService.open(CreateIdeaModalComponent, { size: 'lg' });
    modalRef.result.then(() => {
      this.ideaService.initiateUpdate();
    }).catch(() => {});
  }

  editIdea($event: any, idea: Idea) {
    if($event) {
      $event.stopPropagation();
    }
    const modalRef = this.modalService.open(CreateIdeaModalComponent, { size: 'lg' });
    modalRef.componentInstance.idea = idea;
    modalRef.result.then(() => {
      this.ideaService.initiateUpdate();
    }).catch(() => {});
  }

  approveIdea($event: any, idea: Idea) {
    if($event) {
      $event.stopPropagation();
    }
    this.setIdeaStatus(idea, IdeaStatus.APPROVED);
  }

  discardIdea($event: any, idea: Idea) {
    if($event) {
      $event.stopPropagation();
    }
    this.setIdeaStatus(idea, IdeaStatus.REJECTED);
  }

  returnIdea($event: any, idea: Idea) {
    if($event) {
      $event.stopPropagation();
    }
    this.setIdeaStatus(idea, IdeaStatus.PENDING);
  }

  openTaskView($event: any, id: number) {
    if($event) {
      $event.stopPropagation();
    }
    this.router.navigate([`tasks/${id}`]);
  }

  openIdeaModal(idea: Idea) {
    const modalRef = this.modalService.open(CreateIdeaModalComponent, { size: 'lg' });
    modalRef.componentInstance.idea = idea;
    modalRef.componentInstance.viewMode = true;
  }

  private setIdeaStatus(idea: Idea, status: IdeaStatus) {
    this.ideaService.setIdeaStatus(idea.id, status).subscribe({
      next: () => {
        if(status == IdeaStatus.PENDING) {
          this.alertService.showAlert('success', `Идея возвращена в ожидание`);
        } else {
          this.alertService.showAlert('success', `Идея успешно ${status === IdeaStatus.APPROVED ? 'принята' : 'отклонена'}`);
        }
        this.updateIdeas();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при обновлении статуса идеи: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error updating idea status:', error);
      }
    });
  }

  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faCheck = faCheck;
  protected readonly faTimes = faTimes;
  protected readonly IdeaStatus = IdeaStatus;
  protected readonly faEye = faEye;
  protected readonly faRotateLeft = faRotateLeft;
}
