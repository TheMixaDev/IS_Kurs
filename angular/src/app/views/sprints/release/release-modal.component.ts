import {Component, Input, OnDestroy} from '@angular/core';
import {NgbActiveModal, NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import {faClose, faEdit, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import {TableComponent} from "../../../components/table/table.component";
import {TableRowComponent} from "../../../components/table/table-row.component";
import {TableCellComponent} from "../../../components/table/table-cell.component";
import {Release} from "../../../models/release";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {PrimaryButtonBinding} from "../../../components/bindings/primary-button.binding";
import {ReleaseService} from "../../../services/server/release.service";
import {AlertService} from "../../../services/alert.service";
import {CreateReleaseModalComponent} from "./create-release/create-release-modal.component";
import {HttpErrorResponse} from "@angular/common/http";
import {SprintService} from "../../../services/server/sprint.service";
import {ConfirmModalComponent} from "../../../components/modal/confirm-modal.component";
import {AuthService} from "../../../services/server/auth.service";
import {SprintTeamDto} from "../../../models/dto/sprint-team-dto";
import {WebsocketService} from "../../../services/websocket.service";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-release-modal',
  standalone: true,
  imports: [
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    DatePipe,
    FaIconComponent,
    NgIf,
    UiButtonComponent,
    PrimaryButtonBinding,
    NgbTooltip
  ],
  templateUrl: './release-modal.component.html'
})
export class ReleaseModalComponent implements OnDestroy {
  @Input() releases: Release[] = [];
  @Input() sprintId: number | null = null;
  @Input() sprint: SprintTeamDto | null = null;

  faClose = faClose;
  currentUser = this.authService.getUser();

  wss: Subscription;

  constructor(public activeModal: NgbActiveModal,
              private releaseService: ReleaseService,
              private alertService: AlertService,
              private sprintService: SprintService,
              private modalService: NgbModal,
              private websocketService: WebsocketService,
              private authService: AuthService
  ) {
    this.releaseService.release$.subscribe(() => {
      setTimeout(this.updateReleases.bind(this), 0);
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.wss = this.websocketService.ws$.subscribe(message => {
      if(message.model == 'release' || (message.model == 'sprints' && message.id == this.sprintId)) {
        this.updateReleases();
      }
    })
  }

  ngOnDestroy() {
    this.wss.unsubscribe();
  }

  loadUserData() {
    this.currentUser = this.authService.getUser();
  }

  get isAdmin() : boolean {
    return this.currentUser && this.currentUser.role && this.currentUser.role.id === 1 || false;
  }

  get tableColumns() : string[] {
    let baseColumns = ['Версия', 'Дата релиза', 'Описание'];
    if(this.isAdmin) baseColumns.push('Действия');
    return baseColumns;
  }

  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly faPlus = faPlus;

  updateReleases() {
    if (this.sprintId) {
      this.sprintService.getSprintReleases(this.sprintId).subscribe({
        next: releases => {
          if (releases && !(releases instanceof HttpErrorResponse)) {
            this.releases = releases as Release[];
          } else {
            this.activeModal.close();
          }
        },
        error: () => {
          this.activeModal.close();
        }
      });
    }
  }

  openCreateReleaseModal() {
    const modalRef = this.modalService.open(CreateReleaseModalComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.sprint = this.sprint;
    modalRef.result.then(() => {
      this.releaseService.initiateUpdate();
    });
  }

  openEditModal(release: Release) {
    const modalRef = this.modalService.open(CreateReleaseModalComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.sprint = this.sprint;
    modalRef.componentInstance.release = release;
    modalRef.result.then(() => {
      this.releaseService.initiateUpdate();
    });
  }

  deleteRelease(release: Release) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });

    modalRef.componentInstance.content = `Вы уверены, что хотите удалить релиз ${release.version}?`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.releaseService.deleteRelease(release.id).subscribe({
          next: () => {
            this.alertService.showAlert('success', 'Релиз успешно удален');
            this.releaseService.initiateUpdate();
            this.updateReleases();
          }
        });
      }
    });
  }
}
