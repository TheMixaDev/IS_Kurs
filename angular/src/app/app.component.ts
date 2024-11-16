import {Component, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite'
import {AlertService} from "./services/alert.service";
import {AlertComponent} from "./components/modal/alert.component";
import {AuthComponent} from "./views/auth/auth.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, AuthComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  title = 'calendar';

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe(alert => {
      this.alertComponent.content = alert.message;
      this.alertComponent.type = alert.type;
      this.alertComponent.open();
    });
    initFlowbite();
  }
}
