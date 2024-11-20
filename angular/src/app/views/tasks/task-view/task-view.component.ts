import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Task, TaskPriority} from "../../../models/task";
import {TaskService} from "../../../services/server/task.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCheck, faCircle, faPen, faTrash, faUser} from "@fortawesome/free-solid-svg-icons";
import {PriorityIconPipe} from "../../../pipe/priority-icon.pipe";
import {PriorityParserPipe} from "../../../pipe/priority-parser.pipe";
import {UiDropdownComponent} from "../../../components/ui/ui-dropdown.component";
import {FormsModule} from "@angular/forms";
import {Page} from "../../../models/misc/page";
import {User} from "../../../models/user";
import {UserService} from "../../../services/server/user.service";
import {HttpErrorResponse} from "@angular/common/http";
import {Sprint} from "../../../models/sprint";
import {SprintService} from "../../../services/server/sprint.service";
import {Status} from "../../../models/status";
import {StatusService} from "../../../services/server/status.service";
import {AuthService} from "../../../services/server/auth.service";
import {RoleService} from "../../../services/server/role.service";
import {AlertService} from "../../../services/alert.service";
import {NgIf} from "@angular/common";
import {TaskDto} from "../../../models/dto/task-dto";
import {TableComponent} from "../../../components/table/table.component";
import {TableRowComponent} from "../../../components/table/table-row.component";
import {TableCellComponent} from "../../../components/table/table-cell.component";
import {Risk} from "../../../models/risk";
import {RiskService} from "../../../services/server/risk.service";
import {AddRiskModalComponent} from "./add-risk/add-risk-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TooltipBinding} from "../../../components/bindings/tooltip.binding";
import {UiButtonComponent} from "../../../components/ui/ui-button.component";
import {ConfirmModalComponent} from "../../../components/modal/confirm-modal.component";

@Component({
  selector: 'app-task-view',
  standalone: true,
  imports: [
    FaIconComponent,
    PriorityIconPipe,
    PriorityParserPipe,
    UiDropdownComponent,
    FormsModule,
    NgIf,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    TooltipBinding,
    UiButtonComponent
  ],
  templateUrl: 'task-view.component.html'
})
export class TaskViewComponent implements OnInit {
  taskId: number | null = null;
  originalTask: Task | null = null;
  task: Task | null = null;
  currentUser: User | null = null;

  priorityMap: { [key: string]: string } = {
    'LOW': 'Низкий',
    'MEDIUM': 'Средний',
    'CRITICAL': 'Критичный',
  };

  editingStoryPoints = false;
  @ViewChild('storyPointsInput') storyPointsInput?: ElementRef;

  editingName = false;
  @ViewChild('nameInput') nameInput?: ElementRef;

  risks: Risk[] = [];
  availableRisks: { [key: number]: string } = {};

  users: { [key: string]: string } = {};
  usersLoad: boolean = false;
  usersNative: Page<User> | null = null;

  sprints: { [key: number]: string } = {};
  sprintsLoad: boolean = false;
  sprintsNative: Page<Sprint> | null = null;

  statuses: { [key: number]: string } = {};
  statusesNative: Status[] | null = null;

  _priorityWrapper: string | null = null;
  _implementerWrapper: string | null = null;
  _sprintWrapper: number | null = null;
  _statusWrapper: number | null = null;

  get implementerWrapper(): string | null {
    return this._implementerWrapper;
  }
  set implementerWrapper(value: string | null) {
    this._implementerWrapper = value;
    if(value == null || value.length < 1) {
      if(this.task) {
        this.task.implementer = null;
        this.updateImplementer();
      }
      return;
    }
    if(Object.keys(this.users).includes(value as string) && this.task) {
      this.task.implementer = this.usersNative?.content.filter(u => u.login == value)[0] || null;
      this.updateImplementer();
    } else if(this.task) {
      this.loadUsers(value as string)?.then(() => {
        if(this.task) {
          this.task.implementer = this.usersNative?.content.filter(u => u.login == value)[0] || null;
          this.updateImplementer();
        }
      });
    }
  }

  get sprintWrapper(): number | null {
    return this._sprintWrapper;
  }
  set sprintWrapper(value: number | null) {
    this._sprintWrapper = value;
    if(value == null || value < 1) {
      if(this.task) {
        this.task.sprint = null;
        this.updateSprint();
      }
      return;
    }
    for(let sprintId of Object.keys(this.sprints)) {
      let sprint = this.sprints[parseInt(sprintId)];
      if(sprint == value.toString()) {
        if(this.task) {
          this.task.sprint = this.sprintsNative?.content.filter(s => s.id == parseInt(sprintId))[0] || null;
          this.updateSprint();
        }
        return;
      }
    }
    if(this.task) {
      this.sprintService.getSprint(value).subscribe(sprint => {
        if(!(sprint instanceof HttpErrorResponse)) {
          if(this.task) {
            this.task.sprint = sprint as Sprint;
            this.updateSprint();
          }
          this.loadSprints(sprint.majorVersion)?.then(() => {
            /*if(this.task) {
              this.task.sprint = this.sprintsNative?.content.filter(s => s.id == value)[0] || null;
              // TODO ? DEBUG THROTTLING
            }*/
          });
        }
      })
    }
  }

  get statusWrapper(): number | null {
    return this._statusWrapper;
  }
  set statusWrapper(value: number | null) {
    this._statusWrapper = value;
    if(this.task) {
      this.task.status = this.statusesNative?.filter(s => s.id == value)[0] as Status;
      this.updateStatus();
    }
  }

  get priorityWrapper(): string | null {
    return this._priorityWrapper;
  }
  set priorityWrapper(value: string) {
    this._priorityWrapper = value;
    if(this.task) {
      this.task.priorityEnum = value as TaskPriority;
      this.updatePriority();
    }
  }

  constructor(private route: ActivatedRoute,
              private router: Router,
              private alertService: AlertService,
              private authService: AuthService,
              private taskService: TaskService,
              private userService: UserService,
              private sprintService: SprintService,
              private statusService: StatusService,
              private roleService: RoleService,
              private riskService: RiskService,
              private modalService: NgbModal
              ) {
    this.authService.user$.subscribe(user => this.currentUser = user);
  }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.route.paramMap.subscribe(params => {
      if(params.get('id') as string) {
        this.taskId = parseInt(params.get('id') as string) || null;
        if(this.taskId) {
          this.taskService.getTask(this.taskId).subscribe(task => {
            if(!(task instanceof HttpErrorResponse)) {
              this.task = task as Task;
              this.loadRisks();
              this.updateOriginalTask(task as Task);
              this.implementerWrapper = this.task.implementer?.login || null;
              this.sprintWrapper = this.task.sprint?.id || null;
              this.priorityWrapper = this.task.priorityEnum;
              this.loadStatuses().then(() => {
                this.statusWrapper = task.status.id;
              });
            }
          });
        }
        console.log('Task ID:', this.taskId);
      }
    });
  }

  loadUsers(login: string) : Promise<void> | null {
    if(!login || login.length < 1) {
      this.users = {};
      return null;
    }
    this.usersLoad = true;
    return new Promise(resolve => {
      this.userService.getAllUsers(0, login).subscribe(users => {
        this.usersLoad = false;
        if(!(users instanceof HttpErrorResponse)) {
          this.usersNative = users;
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
    if(!sprint || sprint.length < 1) {
      this.sprints = {};
      return null;
    }
    this.sprintsLoad = true;
    return new Promise(resolve => {
      this.sprintService.getAllSprints(0, sprint).subscribe(sprints => {
        this.sprintsLoad = false;
        if(!(sprints instanceof HttpErrorResponse)) {
          this.sprintsNative = sprints;
          this.sprints = (sprints.content as Sprint[]).reduce((acc: any, sprint) => {
            acc[sprint.id] = sprint.majorVersion;
            return acc;
          }, {})
          resolve();
        }
      })
    })
  }

  loadStatuses() : Promise<void> {
    return new Promise(resolve => {
      if(this.currentUser?.role?.id == 1) {
        this.statusService.getAllStatuses().subscribe(statuses => {
          this.parseStatuses(statuses, resolve);
        });
      } else if (this.currentUser && this.currentUser.role && this.currentUser.role.id) {
        this.roleService.getRoleStatuses(this.currentUser.role.id).subscribe(statuses => {
          this.parseStatuses(statuses, resolve);
        });
      }
    })
  }

  loadRisks() {
    if(!this.task) return;
    this.riskService.getRisksForTask(this.task.id).subscribe(risks => {
      if (!(risks instanceof HttpErrorResponse)) {
        this.risks = risks;
        this.updateAvailableRisks();
      }
    })
  }

  updateAvailableRisks() {
    this.riskService.getAllRisks(0, '').subscribe(risks => {
      if (risks && !(risks instanceof HttpErrorResponse)) {
        this.availableRisks = (risks.content as Risk[]).reduce((acc: any, risk) => {
          acc[risk.id] = risk.description;
          return acc;
        }, {});
        if(this.risks) {
          this.risks.forEach(risk => {
            delete this.availableRisks[risk.id];
          })
        }
      }
    })
  }

  openAddRiskModal() {
    const modalRef = this.modalService.open(AddRiskModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.dropdown = this.availableRisks;
    modalRef.result.then(data => {
      if(data as number) {
        this.addRisk(data);
      }
    });
  }

  addRisk(riskId: number) {
    if (!this.task) return;

    this.riskService.addRiskToTask(this.task.id, riskId).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Риск успешно добавлен к задаче');
        this.loadRisks();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при добавлении риска к задаче: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error adding risk to task:', error);
      }
    });
  }

  openDeleteModal(risk: Risk) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md'
    });
    modalRef.componentInstance.content = `Открепить риск "${risk.description}" от задачи?`;
    modalRef.result.then((result) => {
      if (result === 'delete') {
        this.deleteRisk(risk.id);
      }
    });
  }

  deleteRisk(riskId: number) {
    if (!this.task) return;
    this.riskService.removeRiskFromTask(this.task.id, riskId).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Риск успешно откреплен от задачи');
        this.loadRisks();
      },
      error: (error) => {
        this.alertService.showAlert('danger', 'Ошибка при откреплении риска от задачи: ' + (error?.error?.message || "Неизвестная ошибка"));
        console.error('Error deleting risk from task:', error);
      }
    });
  }

  parseStatuses(statuses : Status[] | HttpErrorResponse, resolve: () => void) {
    if(!(statuses instanceof HttpErrorResponse)) {
      this.statusesNative = statuses;
      this.statuses = (statuses as Status[]).reduce((acc: any, status) => {
        acc[status.id] = status.name;
        return acc;
      }, {})
      resolve();
    }
  }

  assignMyself() {
    if(this.task) {
      this.task.implementer = this.currentUser;
      this.updateImplementer();
      this.implementerWrapper = this.currentUser?.login || null;
    }
  }

  private updateImplementer() {
    if(this.task && this.originalTask &&
      (
        this.task.implementer?.login != this.originalTask.implementer?.login ||
        (this.task.implementer == null && this.originalTask.implementer != null) ||
        (this.task.implementer != null && this.originalTask.implementer == null)
      )
    ) {
      let implementer = this.task.implementer?.login || "";
      this.taskService.assignImplementer(this.task.id, implementer).subscribe(() => {
        this.alertService.showAlert('success', 'Исполнитель обновлен');
        this.updateOriginalTask(this.task as Task);
      });
    }
  }

  updateSprint() {
    if(this.task && this.originalTask &&
      (
        this.task.sprint?.id != this.originalTask.sprint?.id ||
        (this.task.sprint == null && this.originalTask.sprint != null) ||
        (this.task.sprint != null && this.originalTask.sprint == null)
      )
    ) {
      let sprint = this.task.sprint?.id || 0;
      this.taskService.assignSprintToTask(this.task.id, sprint).subscribe(() => {
        this.alertService.showAlert('success', 'Спринт обновлен');
        this.updateOriginalTask(this.task as Task);
      });
    }
  }

  updateStatus() {
    if(this.task && this.originalTask && this.task.status.id != this.originalTask.status.id) {
      // @ts-ignore
      this.taskService.updateTaskStatus(this.task.id, this.task.status.id).subscribe(() => {
        this.alertService.showAlert('success', 'Статус обновлен');
        this.updateOriginalTask(this.task as Task);
      });
    }
  }

  editStoryPoints() {
    this.editingStoryPoints = true;
    setTimeout(() => {
      this.storyPointsInput?.nativeElement.focus();
      this.storyPointsInput?.nativeElement.select();
    }, 0);
  }

  saveStoryPoints() {
    this.editingStoryPoints = false;
    if(this.task && this.originalTask && this.task.storyPoints != this.originalTask.storyPoints) {
      this.taskService.updateTask(this.task.id, { storyPoints: this.task.storyPoints || 0 } as TaskDto).subscribe(() => {
        this.alertService.showAlert('success', 'Story Points обновлены');
        this.updateOriginalTask(this.task as Task);
      })
    }
  }

  editName() {
    this.editingName = true;
    setTimeout(() => {
      this.nameInput?.nativeElement.focus();
      this.nameInput?.nativeElement.select();
    }, 0);
  }

  saveName() {
    this.editingName = false;
    if(this.task && this.originalTask && this.task.name != this.originalTask.name) {
      this.taskService.updateTask(this.task.id, { name: this.task.name } as TaskDto).subscribe(() => {
        this.alertService.showAlert('success', 'Информация обновлена');
        this.updateOriginalTask(this.task as Task);
      })
    }
  }

  updatePriority() {
    if(this.task && this.originalTask && this.task.priorityEnum != this.originalTask.priorityEnum) {
      this.taskService.updateTask(this.task.id, { priorityEnum: this.task.priorityEnum } as TaskDto).subscribe(() => {
        this.alertService.showAlert('success', 'Приоритет обновлен');
        this.updateOriginalTask(this.task as Task);
      })
    }
  }

  updateOriginalTask(task: Task) {
    this.originalTask = JSON.parse(JSON.stringify(task));
  }

  openDeleteTaskModal() {
    const modal = this.modalService.open(ConfirmModalComponent);
    modal.componentInstance.message = 'Вы действительно хотите удалить задачу № ' + this.task?.id + '?';
    modal.componentInstance.warning = 'Вся информация, связанная с задачей, будет утеряна.';
    modal.result.then((result) => {
      if (result === 'delete') {
        this.deleteTask();
      }
    });
  }

  deleteTask() {
    if(this.task) {
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.alertService.showAlert('success', 'Задача удалена');
        this.router.navigate(['tasks']);
      });
    }
  }

  protected readonly faPen = faPen;
  protected readonly faCircle = faCircle;
  protected readonly faCheck = faCheck;
  protected readonly faUser = faUser;
  protected readonly faTrash = faTrash;
}
