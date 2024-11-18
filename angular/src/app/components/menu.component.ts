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
  faUser, faUsers
} from "@fortawesome/free-solid-svg-icons";
import {AuthService} from "../services/server/auth.service";
import {User} from "../models/user";
import {AsyncPipe, NgIf} from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {RouterLink} from "@angular/router";



@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    SideItemBinding,
    AsyncPipe,
    NgIf,
    FontAwesomeModule,
    RouterLink
  ],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

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
  protected readonly faUsers = faUsers;
}
