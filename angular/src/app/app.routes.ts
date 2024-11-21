import { Routes } from '@angular/router';
import {SprintsComponent} from "./views/sprints/sprints.component";
import {StatusComponent} from "./views/status/status.component";
import {RoleComponent} from "./views/role/role.component";
import {IdeaComponent} from "./views/idea/idea.component";
import {TeamsComponent} from "./views/teams/teams.component";
import {UsersComponent} from "./views/users/users.component";
import {TasksComponent} from "./views/tasks/tasks.component";
import {RiskComponent} from "./views/risk/risk.component";
import {TaskViewComponent} from "./views/tasks/task-view/task-view.component";
import { TagComponent } from './views/tags/tag.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: SprintsComponent
  },
  {
    path: 'tasks',
    component: TasksComponent
  },
  {
    path: 'tasks/:id',
    component: TaskViewComponent
  },
  {
    path: 'idea',
    component: IdeaComponent
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'teams',
    component: TeamsComponent
  },
  {
    path: 'status',
    component: StatusComponent
  },
  {
    path: 'role',
    component: RoleComponent
  },
  {
    path: 'risk',
    component: RiskComponent
  },
  {
    path: 'tag',
    component: TagComponent
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];
