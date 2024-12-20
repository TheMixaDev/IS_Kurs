import {Component, OnDestroy, OnInit} from "@angular/core";
import {faEdit, faPlus, faSearch} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {Page} from "../../models/misc/page";
import {User} from "../../models/user";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../services/server/user.service";
import {AuthService} from "../../services/server/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {CreateUserModalComponent} from "./create-user/create-user-modal.component";
import {NgIf} from "@angular/common";
import {AlertService} from "../../services/alert.service";
import {LoaderService} from "../../services/loader.service";
import {WebsocketService} from "../../services/websocket.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FaIconComponent,
    FormsModule,
    PrimaryButtonBinding,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    UiButtonComponent,
    TooltipBinding,
    NgIf,
    NgbTooltip
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnDestroy {
  users: Page<User> | null = null;
  currentPage: number = 0;
  currentUser: User | null = this.authService.getUser();

  initialized = false;

  search = '';

  wss: Subscription;

  constructor(private userService : UserService,
              private authService: AuthService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private modalService: NgbModal,
              private websocketService: WebsocketService
  ) {
    this.userService.user$.subscribe(() => {
      this.updateUsers();
    });
    this.authService.user$.subscribe(this.loadUserData.bind(this));
    this.loaderService.loader(true);
    this.wss = this.websocketService.ws$.subscribe(message => {
      if(message.model == 'user' || message.model == 'userWipe' || message.model == 'team' || message.model == 'role') {
        this.updateUsers(false);
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

  ngOnInit() {
    this.updateUsers();
  }

  updateUsers(showLoader ?: boolean) {
    if(showLoader)
      this.loadingData = true;
    this.userService.getAllUsers(this.currentPage, this.search, 0, false).subscribe(users => {
      if(showLoader)
        this.loadingData = false;
      if(!this.initialized) {
        this.initialized = true;
        this.loaderService.loader(false);
      }
      if(users instanceof HttpErrorResponse) return;
      this.users = users;
    })
  }

  searchChange() {
    this.updateUsers();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateUsers();
  }

  createClick() {
    this.modalService.open(CreateUserModalComponent, { size: 'lg' });
  }

  editUser(user: User) {
    const modalRef = this.modalService.open(CreateUserModalComponent, { size: 'lg' });
    modalRef.componentInstance.user = user;
  }

  protected readonly faSearch = faSearch;
  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;

  copyEmail(email: string | null) {
    if(email) {
      navigator.clipboard.writeText(email).then(() => {
        this.alertService.showAlert('success', 'Email скопирован');
      }).catch(() => {
        this.alertService.showAlert('danger', 'Не удалось скопировать email');
      });
    }
  }
}
