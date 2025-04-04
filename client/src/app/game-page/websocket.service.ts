import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
// import { WebSocketSubject, webSocket } from "rxjs/webSocket";
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})

export class WebSocketService {
  //private socket$: WebSocketSubject<any>;
  //
  private socket$: WebSocketSubject<unknown>
  private messageSubject = new Subject<unknown>;


  constructor() {
    this.socket$ = new WebSocketSubject('ws://localhost:4567/api/websocket'); //Using this link instead of ${environment.wsURl} temp,as we have not created an environment
    this.socket$.subscribe(
      (message) => this.handleMessage(message),
      //(message) => this.handleMessage(message),
      (err) => console.error('WebSocket error:', err),
      () => console.log('WebSocket connection closed')
    );
    //from it-3-mary-shellys-cool-1918-howard-frankendogs-football-team/client/src/app
  }
  //
  sendMessage(message: unknown) {
    this.socket$.next(message);
  }

  getMessage() {
    return this.messageSubject.asObservable();
  }
  handleMessage(message: unknown) {
    this.messageSubject.next(message);
  }

}
