import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {WebsocketMessage} from "../models/misc/websocket-message";
import { webSocket } from 'rxjs/webSocket';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private wsSubject = new Subject<WebsocketMessage>();
  ws$ = this.wsSubject.asObservable();

  url = 'ws://localhost:8080/ws';

  constructor() {
    let subject = webSocket(this.url);
    subject.subscribe(
      (message) => this.call(message as WebsocketMessage),
      error => console.log(error),
      () => console.log('complete')
    );
    console.log('Websocket connected!');
  }

  private call(message: WebsocketMessage) {
    this.wsSubject.next(message);
  }
}
