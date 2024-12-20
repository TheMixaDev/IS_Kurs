import {Component, OnDestroy, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faEdit, faPlus, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
import { AlertService } from "../../services/alert.service";
import { initFlowbite } from "flowbite";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { Risk } from "../../models/risk";
import { RiskService } from "../../services/server/risk.service";
import { TopRiskDto } from "../../models/dto/top-risk-dto";
import { HttpErrorResponse } from "@angular/common/http";
import { Page } from "../../models/misc/page";
import { CreateRiskModalComponent } from "./create-risk/create-risk-modal.component";
import { FormsModule } from '@angular/forms';
import {AuthService} from "../../services/server/auth.service";
import {NgIf} from "@angular/common";
import {LoaderService} from "../../services/loader.service";
import {WebsocketService} from "../../services/websocket.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [
    FaIconComponent,
    PrimaryButtonBinding,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent,
    FormsModule,
    NgIf,
    NgbTooltip,
  ],
  templateUrl: './risk.component.html'
})
export class RiskComponent implements OnInit, OnDestroy {

  topTenRisks: TopRiskDto[] = [];
  allRisks: Page<Risk> | null = null;
  currentPage: number = 0;
  currentUser = this.authService.getUser();

  _initialized = 0;

  get initialized() {
    return this._initialized;
  }

  set initialized(value) {
    if(value > 2) return;
    this._initialized = value;
    if(value == 2) {
      this.loaderService.loader(false);
    }
  }

  search = '';

  wss: Subscription;

  constructor(private riskService: RiskService,
              private alertService: AlertService,
              private authService: AuthService,
              private loaderService: LoaderService,
              private websocketService: WebsocketService,
              private modalService: NgbModal
  ) {
    this.riskService.risk$.subscribe(() => {
      this.loadTopRisks();
      this.loadRisks();
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.loaderService.loader(true);
    this.wss = this.websocketService.ws$.subscribe(message => {
      if(message.model == 'risk') {
        this.loadRisks(false);
        this.loadTopRisks();
      }
    })
  }

  ngOnDestroy() {
    this.wss.unsubscribe();
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

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  get tableColumns() : string[] {
    let baseColumns = ['Описание', 'Вероятность', 'Потери'];
    if(this.isAdmin) baseColumns.push('Действия');
    return baseColumns;
  }

  ngOnInit() {
    this.loadTopRisks();
    this.loadRisks();
    initFlowbite();
  }

  loadRisks(showLoader : boolean = true) {
    if(showLoader)
      this.loadingData = true;
    this.riskService.getAllRisks(this.currentPage, this.search).subscribe(risks => {
      if(showLoader)
        this.loadingData = false;
      this.initialized++;
      if(risks instanceof HttpErrorResponse) return;
      this.allRisks = risks;
      if(this.currentPage != 0 && this.allRisks.content.length === 0){
        this.currentPage = this.currentPage - 1;
        this.loadRisks();
      }
    })
  }

  loadTopRisks() {
    this.riskService.getTop10Risks().subscribe(risks => {
      this.initialized++;
      if(risks as TopRiskDto[]) {
        this.topTenRisks = risks as TopRiskDto[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о ролях");
      }
    });
  }

  searchChange() {
    this.loadRisks();
    this.currentPage = 0;
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadRisks();
  }

  openCreateModal(){
    this.modalService.open(CreateRiskModalComponent, {
      size: 'lg'
    });

  }

  openEditModal(risk: Risk){
    if (risk) {
      const modalRef = this.modalService.open(CreateRiskModalComponent, {
        size: 'lg'
      });
      modalRef.componentInstance.risk = risk;
    }
  }

  openDeleteModal(risk: Risk) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Вы уверены, что хотите удалить риск "${risk.description}"?`;
    modalRef.componentInstance.warning = `При удалении риска, он удалится у всех задач.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.riskService.deleteRisk(risk.id).subscribe({
          next: () => {
            this.loadTopRisks();
            this.loadRisks();
            this.alertService.showAlert('success', 'Риск успешно удален');
          },
          error: (error) => {
            this.alertService.showAlert('danger', 'Ошибка при удалении риска: ' + (error?.error?.message || "Неизвестная ошибка"));
            console.error('Error deleting risk:', error);
          }
        });
      }
    });
  }



  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faSearch = faSearch;
}
