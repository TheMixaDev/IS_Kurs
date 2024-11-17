import {Component, OnInit} from "@angular/core";
import {initFlowbite} from "flowbite";
import {SideItemBinding} from "./bindings/side-item.binding";
import {
  faBolt,
  faCalendar,
  faChartSimple,
  faLightbulb,
  faListCheck,
  faStar,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import {AuthService} from "../services/server/auth.service";
import {UserService} from "../services/server/user.service";
import {User} from "../models/user";
import {AsyncPipe, NgIf} from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    SideItemBinding,
    AsyncPipe,
    NgIf,
    FontAwesomeModule
  ],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    initFlowbite();
    this.loadUserData();
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getUser();
    console.log(this.currentUser);
  }

  logout(): void {
    this.authService.logout();
  }

  protected readonly faCalendar = faCalendar;
  protected readonly faListCheck = faListCheck;
  protected readonly faUser = faUser;
  protected readonly faLightbulb = faLightbulb;
  protected readonly faChartSimple = faChartSimple;
  protected readonly faStar = faStar;
  protected readonly faBolt = faBolt;
}
