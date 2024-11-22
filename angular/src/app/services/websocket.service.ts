import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {WebsocketMessage} from "../models/misc/websocket-message";
import { webSocket } from 'rxjs/webSocket';
import {environment} from "../environments/environment";
import {AlertService} from "./alert.service";

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private wsSubject = new Subject<WebsocketMessage>();
  ws$ = this.wsSubject.asObservable();

  url = environment.wsUrl;

  constructor(private alertService: AlertService) {
    let subject = webSocket(this.url);
    subject.subscribe(
      (message) => this.call(message as WebsocketMessage),
      (error) => {
        if(!localStorage.getItem("hideErrorWS"))
          this.alertService.showAlert('danger', 'Не удалось подключиться к сервису обновлений. Перезагрузите страницу.');
        console.error(error);
      },
      () => console.log('complete')
    );
    console.log('Websocket connected!');
  }

  private call(message: WebsocketMessage) {
    this.wsSubject.next(message);
  }
}
