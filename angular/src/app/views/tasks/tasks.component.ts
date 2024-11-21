import {Component, OnInit} from "@angular/core";
import {
  faEdit,
  faPlus,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {PrimaryButtonBinding} from "../../components/bindings/primary-button.binding";
import {TableComponent} from "../../components/table/table.component";
import {TableRowComponent} from "../../components/table/table-row.component";
import {TableCellComponent} from "../../components/table/table-cell.component";
import {UiButtonComponent} from "../../components/ui/ui-button.component";
import {Page} from "../../models/misc/page";
import {User} from "../../models/user";
import {UserService} from "../../services/server/user.service";
import {AuthService} from "../../services/server/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {TooltipBinding} from "../../components/bindings/tooltip.binding";
import {TaskService} from "../../services/server/task.service";
import {Task} from "../../models/task";
import {StatusService} from "../../services/server/status.service";
import {SprintService} from "../../services/server/sprint.service";
import {Status} from "../../models/status";
import {Sprint} from "../../models/sprint";
import {UiDropdownComponent} from "../../components/ui/ui-dropdown.component";
import {DatePipe, NgIf} from "@angular/common";
import {PriorityParserPipe} from "../../pipe/priority-parser.pipe";
import {ActivatedRoute, Router} from "@angular/router";
import {PriorityIconPipe} from "../../pipe/priority-icon.pipe";
import {CreateTaskModalComponent} from "./create-task/create-task-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-tasks',
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
    UiDropdownComponent,
    DatePipe,
    PriorityParserPipe,
    PriorityIconPipe,
    NgIf
  ],
  templateUrl: 'tasks.component.html'
})
export class TasksComponent implements OnInit {
  tasks: Page<Task> | null = null;
  currentPage: number = 0;
  currentUser: User | null = null;

  statuses: { [key: number]: string } = {};
  users: { [key: string]: string } = {};
  usersLoad: boolean = false;
  sprints: { [key: number]: string } = {};
  sprintsLoad: boolean = false;


  _selectedStatusId: number | null = null;
  _selectedImplementerLogin: string | null = null;
  _selectedSprintId: number | null = null;

  get selectedStatusId() {
    return this._selectedStatusId;
  }
  set selectedStatusId(value) {
    this._selectedStatusId = value;
    this.currentPage = 0;
    this.updateTasks();
  }
  get selectedImplementerLogin() {
    return this._selectedImplementerLogin;
  }
  set selectedImplementerLogin(value) {
    this._selectedImplementerLogin = value;
    this.currentPage = 0;
    this.updateTasks();
  }
  get selectedSprintId() {
    return this._selectedSprintId;
  }
  set selectedSprintId(value) {
    this._selectedSprintId = value;
    this.currentPage = 0;
    this.updateTasks();
  }


  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private statusService: StatusService,
    private sprintService: SprintService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.authService.user$.subscribe(user => this.currentUser = user);
  }

  ngOnInit() {
    let subscription = this.route.queryParams.subscribe(params => {
      const sprintId = params['sprintId'] || null;
      const sprintVersion = params['sprintVersion'] || null;
      this.loadCurrentUser();
      this.loadStatuses();
      if(sprintId && sprintVersion) {
        this.goToSprint(null, sprintId, sprintVersion);
      } else if(this.currentUser) {
        this.goToUser(null, this.currentUser);
      } else {
        this.updateTasks();
      }
      subscription.unsubscribe();
    })
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getUser();
  }

  updateTasks() {
    this.taskService.getAllTasks(this.currentPage,
      this.selectedStatusId || undefined,
      this.selectedImplementerLogin || undefined,
      this.selectedSprintId || undefined).subscribe({
      next: tasks => {
        if (!(tasks instanceof HttpErrorResponse)) {
          this.tasks = tasks;
        }
      }
    });
  }


  changePage(page: number) {
    this.currentPage = page;
    this.updateTasks();
  }

  loadStatuses() {
    this.statusService.getAllStatuses().subscribe(statuses => {
      if(!(statuses instanceof HttpErrorResponse))
        this.statuses = (statuses as Status[]).reduce((acc: any, status) => {
          acc[status.id] = status.name;
          return acc;
        }, {})
    })
  }

  loadUsers(login: string) : Promise<void> | null {
    if(login.length < 1) {
      this.users = {};
      return null;
    }
    this.usersLoad = true;
    return new Promise(resolve => {
      this.userService.getAllUsers(0, login).subscribe(users => {
        this.usersLoad = false;
        if(!(users instanceof HttpErrorResponse)) {
          this.users = (users.content as User[]).reduce((acc: any, user) => {
            acc[user.login] = `${user.firstName} ${user.lastName}`;
            return acc;
          }, {});
          resolve();
        }
      })
    });
  }

  loadSprints(sprint: string) : Promise<void> | null  {
    if(sprint.length < 1) {
      this.sprints = {};
      return null;
    }
    this.sprintsLoad = true;
    return new Promise(resolve => {
      this.sprintService.getAllSprints(0, sprint).subscribe(sprints => {
        this.sprintsLoad = false;
        if(!(sprints instanceof HttpErrorResponse)) {
          this.sprints = (sprints.content as Sprint[]).reduce((acc: any, sprint) => {
            acc[sprint.id] = sprint.majorVersion;
            return acc;
          }, {})
          resolve();
        }
      })
    })
  }

  openCreateModal() {
    const modalRef = this.modalService.open(CreateTaskModalComponent, {
      size: 'lg'
    });
  }

  goToUser($event: any, implementer: User) {
    if($event) {
      $event.stopPropagation();
    }
    this.loadUsers(implementer.login)?.then(() => {
      this.selectedImplementerLogin = implementer.login;
    });
  }

  goToSprint($event: any, sprintId: number, sprintVersion: string) {
    if($event) {
      $event.stopPropagation();
    }
    this.loadSprints(sprintVersion)?.then(() => {
      this.selectedSprintId = sprintId;
    });
  }

  goToStatus($event: any, status: Status) {
    if($event) {
      $event.stopPropagation();
    }
    this.selectedStatusId = status.id;
  }

  goToTask(task: Task) {
    this.router.navigate([`tasks/${task.id}`]);
  }

  protected readonly faPlus = faPlus;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
}
