import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSubject = new Subject<{ type: string; message: string }>();
  alert$ = this.alertSubject.asObservable();

  showAlert(type: string, message: string) {
    this.alertSubject.next({ type, message });
  }
}
