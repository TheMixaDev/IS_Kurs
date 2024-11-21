import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faChartSimple, faEdit, faPlus, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
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
export class RiskComponent implements OnInit {

  topTenRisks: TopRiskDto[] = [];
  allRisks: Page<Risk> | null = null;
  currentPage: number = 0;
  currentUser = this.authService.getUser();

  search = '';

  constructor(private riskService: RiskService,
              private alertService: AlertService,
              private authService: AuthService,
              private modalService: NgbModal
  ) {
    this.riskService.risk$.subscribe(() => {
      this.loadTopRisks();
      this.loadRisks();
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
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

  loadRisks() {
    this.riskService.getAllRisks(this.currentPage, this.search).subscribe(risks => {
      if(risks instanceof HttpErrorResponse) return;
      this.allRisks = risks;
      if(this.currentPage != 0 && this.allRisks.content.length === 0){
        this.currentPage = this.currentPage - 1;
        this.loadRisks();
      }
    })
  }

  loadTopRisks() {
    this.topTenRisks = [];
    this.riskService.getTop10Risks().subscribe(risks => {
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
  protected readonly faChartSimple = faChartSimple;
  protected readonly faSearch = faSearch;
}
