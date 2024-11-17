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

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    SideItemBinding
  ],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    initFlowbite();
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
