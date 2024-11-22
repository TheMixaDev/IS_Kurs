import {Component, Renderer2, ViewChild} from '@angular/core';
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
import {LoaderComponent} from "./components/loader.component";
import {LoaderService} from "./services/loader.service";
import {WebsocketService} from "./services/websocket.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, AuthComponent, AsyncPipe, NgIf, MenuComponent, LoaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  isLoggedIn$ = this.authService.token$;
  loader = true;
  ignoreLoader = false;
  appStart = new Date().getTime();
  appInitialized = false;

  constructor(
    private alertService: AlertService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private userService: UserService,
    private websocketService: WebsocketService,
    private renderer: Renderer2
  ) {
    this.alertService.alert$.subscribe(alert => {
      this.alertComponent.content = alert.message;
      this.alertComponent.type = alert.type;
      this.alertComponent.open();
    });

    this.loaderService.loader$.subscribe(loader => {
      if(this.ignoreLoader) return;
      if(!this.appInitialized && !loader.show) {
        this.appInitialized = true;
        let loadTime = new Date().getTime() - this.appStart;
        console.log(`App initialized in ${loadTime}ms`);
        let loadThreshold = Number(localStorage.getItem("loadLimit")) || 400;
        if(loadTime < loadThreshold) {
          this.ignoreLoader = true;
          this.setGlobalLoaderHidden(true);
        }
      }
      this.loader = loader.show;
    })

    this.websocketService.ws$.subscribe(message => {
      console.log(message);
    });

    this.restoreUserSession();

    initFlowbite();
  }

  private setGlobalLoaderHidden(hidden: boolean) {
    if (hidden) {
      this.renderer.addClass(document.body, 'ignore-main-loader');
    } else {
      this.renderer.removeClass(document.body, 'ignore-main-loader');
    }
  }

  private restoreUserSession() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.authService.setToken(token);

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (!(user instanceof HttpErrorResponse)) {
          this.authService.setUser(user);
        } else {
          this.authService.logout();
        }
      },
      error: () => {
        this.authService.logout();
      }
    });
  }
}
