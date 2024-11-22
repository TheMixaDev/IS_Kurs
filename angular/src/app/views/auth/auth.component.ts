import { Component, OnInit } from "@angular/core";
import { PrimaryButtonBinding } from "../../components/bindings/primary-button.binding";
import { AuthService } from "../../services/server/auth.service";
import { AlertService } from "../../services/alert.service";
import { JwtRequestDto } from "../../models/dto/jwt-request-dto";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [PrimaryButtonBinding, FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {

  login = new FormControl('');
  password = new FormControl('');
  sending:boolean = false;

  constructor(private authService: AuthService, private alertService: AlertService) { }

  ngOnInit() { }

  onSubmit() {
    const loginRequest: JwtRequestDto = {
      username: this.login.value || '',
      password: this.password.value || ''
    };
    this.sending = true;

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Успешная авторизация!');
      },
      error: (error) => {
        this.sending = false;
        this.alertService.showAlert('danger', (error.error?.message || 'Неизвестная ошибка'));
      }
    });
  }
}
