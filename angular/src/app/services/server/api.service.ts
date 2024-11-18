import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';

import { AuthService } from './auth.service';
import {Observable, throwError} from "rxjs";
import {AlertService} from "../alert.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = 'http://localhost:8080/api';

  constructor(private authService: AuthService, private alertService: AlertService) {
    this.handleError = this.handleError.bind(this);
  }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    })
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 401) {
      this.authService.logout();
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
        this.alertService.showAlert('danger', errorMessage);
      } else {
        errorMessage = `Error Status: ${error.status}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
