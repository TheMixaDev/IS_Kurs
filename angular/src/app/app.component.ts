import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AlertService } from "./services/alert.service";
import { AlertComponent } from "./components/modal/alert.component";
import { AuthComponent } from "./views/auth/auth.component";
import { AuthService } from "./services/server/auth.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {MenuComponent} from "./components/menu.component";
import { UserService } from './services/server/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, AuthComponent, AsyncPipe, NgIf, MenuComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  isLoggedIn$ = this.authService.token$;

  constructor(
    private alertService: AlertService, 
    private authService: AuthService, 
    private userService: UserService
  ) {
    this.alertService.alert$.subscribe(alert => {
      this.alertComponent.content = alert.message;
      this.alertComponent.type = alert.type;
      this.alertComponent.open();
    });

    const token = localStorage.getItem('token');
    if (token) {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          if (!(user instanceof HttpErrorResponse)) {
            this.authService.setToken(token);
            this.authService.setUser(user);
          }
        },
        error: (error) => {
          console.error('Authentication error:', error);
          this.authService.logout();
        },
        complete: () => {
          console.log('Authentication check completed');
        }
      });
    }

    initFlowbite();
  }
}
