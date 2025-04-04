import { Injectable, OnDestroy} from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Subject, Observable, timer, Subscription, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface JoinData {
  gameCode: string;
}

interface JudgeData {
  judgeName: string; // or id
}

interface WinnerData {
  winnerName: string; // or id
}

interface GameStateData {
  currentRound: number;
  playerScores: { [playerName: string]: number };
  currentJudge: string;
  roundWinner: string | null;
  gameWinner: string | null;
}

type MessageData = JoinData | JudgeData | WinnerData | GameStateData | object;

interface GameMessage{
  type: string;
  data: MessageData;
}


@Injectable({
  providedIn: 'root',
})

export class WebSocketService implements OnDestroy {
  private socket$: WebSocketSubject<GameMessage>;
  private messageSubject = new Subject<GameMessage>();
  private reconnectionInterval = 5000;
  private subscription: Subscription;
  private openSubject = new Subject<void>();
  private connectionStatus = new Subject<boolean>();

  constructor() {
    this.connect();
  }
  private connect() {
    this.socket$ = webSocket<GameMessage>({
      url: `${environment.wsUrl}`,//we need to put our environment url (the deployment id) here from the environment file.
      serializer: (msg) => JSON.stringify(msg),
      deserializer: (msg) => JSON.parse(msg.data),
    });

    this.subscription = this.socket$
      .pipe(
        catchError((error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus.next(false);
          return timer(this.reconnectionInterval).pipe(
            mergeMap(() => throwError(() => error))
          );
        })
      )
      .subscribe({
        next: (message) => this.handleMessage(message),
        complete: () => {
          console.log('WebSocket connection closed');
          this.connectionStatus.next(false);
          this.connect(); // Reconnect on close
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus.next(false);
        },

      });
  }

  sendMessage(type: string, data: MessageData) {
    this.socket$.next({ type, data});
  }

  getMessage(): Observable<GameMessage> {
    return this.messageSubject.asObservable();
  }

  handleMessage(message: GameMessage) {
    this.messageSubject.next(message);
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  //getOpenStatus(): Observable<boolean> {
  //return this.openSubject.asObservable();
  //}

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
