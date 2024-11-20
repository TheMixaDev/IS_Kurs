import {Component, OnInit} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {faChartSimple, faEdit, faPlus, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { RoleService } from "../../services/server/role.service";
import { Role } from "../../models/role";
import { AlertService } from "../../services/alert.service";
import { initFlowbite } from "flowbite";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal.component";
import { Risk } from "../../models/risk";
import { RiskService } from "../../services/server/risk.service";
import { TopRiskDto } from "../../models/dto/top-risk-dto";
import { HttpErrorResponse } from "@angular/common/http";
import { Page } from "../../models/misc/page";
import { UiDropdownComponent } from "../../components/ui/ui-dropdown.component";

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [
    FaIconComponent,
    UiDropdownComponent,
    PrimaryButtonBinding,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    TooltipBinding,
    UiButtonComponent
  ],
  templateUrl: './risk.component.html'
})
export class RiskComponent implements OnInit {

  topTenRisks: TopRiskDto[] = [];
  allRisks: Page<Risk> | null = null;
  currentPage: number = 0;

  constructor(private riskSerive: RiskService, private alertService: AlertService, private modalService: NgbModal) {
    this.riskSerive.risk$.subscribe(() => {
      this.loadTopRisks();
    });
  }

  ngOnInit() {
    this.loadTopRisks();
    this.loadRisks();
    initFlowbite();
  }

  loadRisks() {
    this.riskSerive.getAllRisks(this.currentPage).subscribe(risks => {
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

  changePage(page: number) {
    this.currentPage = page;
    this.loadRisks();
  }

  

  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faChartSimple = faChartSimple;
}
