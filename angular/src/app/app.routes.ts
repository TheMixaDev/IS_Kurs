import { Routes } from '@angular/router';
import {SprintsComponent} from "./views/sprints/sprints.component";
import {StatusComponent} from "./views/status/status.component";
import {RoleComponent} from "./views/role/role.component";
import {IdeaComponent} from "./views/idea/idea.component";
import {TeamsComponent} from "./views/teams/teams.component";
import {UsersComponent} from "./views/users/users.component";

export const routes: Routes = [
  {
    path: '',
    component: SprintsComponent
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
  }
];
