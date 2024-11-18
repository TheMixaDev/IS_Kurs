import { Routes } from '@angular/router';
import {SprintsComponent} from "./views/sprints/sprints.component";
import {StatusComponent} from "./views/status/status.component";
import {RoleComponent} from "./views/role/role.component";
import {IdeaComponent} from "./views/idea/idea.component";

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
    path: 'status',
    component: StatusComponent
  },
  {
    path: 'role',
    component: RoleComponent
  }
];
