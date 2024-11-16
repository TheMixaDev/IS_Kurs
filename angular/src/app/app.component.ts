import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AlertService } from "./services/alert.service";
import { AlertComponent } from "./components/modal/alert.component";
import { AuthComponent } from "./views/auth/auth.component";
import { AuthService } from "./services/server/auth.service";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, AuthComponent, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  isLoggedIn$ = this.authService.token$; // Use the observable for dynamic updates

  constructor(private alertService: AlertService, private authService: AuthService) {
    this.alertService.alert$.subscribe(alert => {
      this.alertComponent.content = alert.message;
      this.alertComponent.type = alert.type;
      this.alertComponent.open();
    });
    initFlowbite();
  }
}
