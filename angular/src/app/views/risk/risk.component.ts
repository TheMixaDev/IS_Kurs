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
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { Risk } from "../../models/risk";
import { RiskService } from "../../services/server/risk.service";
import { TopRiskDto } from "../../models/dto/top-risk-dto";
import { HttpErrorResponse } from "@angular/common/http";
import { Page } from "../../models/misc/page";
import { CreateRiskModalComponent } from "./create-risk/create-risk-modal.component";
import { FormsModule } from '@angular/forms';

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
  ],
  templateUrl: './risk.component.html'
})
export class RiskComponent implements OnInit {

  topTenRisks: TopRiskDto[] = [];
  allRisks: Page<Risk> | null = null;
  currentPage: number = 0;

  search = '';

  constructor(private riskSerive: RiskService, private alertService: AlertService, private modalService: NgbModal) {
    this.riskSerive.risk$.subscribe(() => {
      this.loadTopRisks();
      this.loadRisks();
    });
  }

  ngOnInit() {
    this.loadTopRisks();
    this.loadRisks();
    initFlowbite();
  }

  loadRisks() {
    this.riskSerive.getAllRisks(this.currentPage, this.search).subscribe(risks => {
      if(risks instanceof HttpErrorResponse) return;
      this.allRisks = risks;
    })
  }

  loadTopRisks() {
    this.topTenRisks = [];
    this.riskSerive.getTop10Risks().subscribe(risks => {
      if(risks as TopRiskDto[]) {
        this.topTenRisks = risks as TopRiskDto[];
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о ролях");
      }
    });
  }

  searchChange() {
    this.loadTopRisks();
    this.loadRisks();
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
    modalRef.componentInstance.warning = `При удалении риска, он удалится у всех задач и тегов.`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.riskSerive.deleteRisk(risk.id).subscribe({
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
