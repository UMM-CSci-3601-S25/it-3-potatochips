import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
//import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Game } from '../game';
import { catchError, map, switchMap } from 'rxjs/operators';
//import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-game-page',
  templateUrl: 'game-page.html',
  styleUrls: ['./game-page.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    CommonModule,
    MatSnackBarModule, // Add CommonModule to imports
  ]
})
export class GameComponent {
  prompt: string = ''; // Initialize the prompt property
  game: WritableSignal<Game | null> = signal(null); // Use WritableSignal and initialize with null
  error = signal({help: '', httpResponse: '', message: ''});

  private socket: WebSocket;

  private readonly PONG_TIMEOUT = ((1000 * 5) + (1000 * 1)) // 5 + 1 second for buffer
  private readonly PING_INTERVAL = 5000;
  private heartbeatInterval: number;
  private pongTimeout: number;
  private snackBar = inject(MatSnackBar);

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router
  ) {

    this.socket = new WebSocket(environment.wsUrl);
    this.WebsocketSetup();
    window.onbeforeunload = () => {
      this.leaveGame();
      return;
    }
    // this.socket.onclose = () => {
    //   if(this.socket.readyState === WebSocket.CLOSED) {
    // const gameId = this.game()?._id;
    // const connectedPlayers = this.game()?.connectedPlayers;
    // connectedPlayers[this.playerId] = false;
    // this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{connectedPlayers: connectedPlayers}}).subscribe();
    // console.log('testRemove received');
    //   }
    // }
    // Initialize the game signal with data from the server

    // Initialize the game signal with data from the server
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the game – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of(null);
      })
    ).subscribe((game) => this.game.set(game)); // Update the signal with the fetched game
  }




  public WebsocketSetup() {
    this.cleanupWebSocket(); //Making sure that the websocket is re-usable since were using it again.
    //this.socket = new WebSocket("${environment.wsUrl}");
    this.socket = new WebSocket(environment.wsUrl);;
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.Heartbeat();
    };


    this.socket.onmessage = (event) => {
      if (event.data === 'ping') {
        console.log('ping received from server')
        this.socket.send('pong');
      }
      const sanitizedData = event.data.replace(/[\n\r]/g, '');
      console.log('WebSocket message received:', sanitizedData);
      this.refreshGame();
    };


    this.socket.onclose = () => {
      console.warn('WebSocket connection closed. Reconnecting...');
      this.cleanupWebSocket();
      setTimeout(() => this.WebsocketSetup(), 0);
    };
  }


  public Heartbeat() {
    setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send('ping');
        this.resetPongTimeout();
      }
    }, this.PING_INTERVAL);
  }


  public resetPongTimeout() {
    clearTimeout(this.pongTimeout);
    setTimeout(() => {
      console.warn('Pong not received. Reconnecting...');
      this.socket.close(); // This will trigger onclose to reconnect
    }, this.PONG_TIMEOUT);


  }


  public cleanupWebSocket() {
    clearInterval(this.heartbeatInterval);
    clearTimeout(this.pongTimeout);
  }



  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action,{
      duration: 3000, // Duration in milliseconds
    });
  }

  refreshGame() {
    const gameId = this.game()?.['_id'];
    if (gameId) {
      this.httpClient.get<Game>(`/api/game/${gameId}`).subscribe((updatedGame) => {
        this.game.set(updatedGame); // Update the game state
      });
    }
  }

  // submitPrompt() {
  //   const gameId = this.game()?._id;
  //   this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{prompt: this.submission}}).subscribe();
  //   //console.log(this.submission);
  //   //this.isPromptSubmitted = true; // Mark the prompt as submitted
  //   this.displayedPrompt = this.submission; // Store the submitted prompt
  //   this.submission = ''; // Clear the input field
  // }

  submitResponse() {
    const gameId = this.game()?._id;
    const responses = this.game()?.responses || [];

    if (responses.includes(this.response)) {
      this.openSnackBar(`Duplicate response detected: "${this.response}". This response cannot be submitted.`, 'Dismiss');
      this.response = '';
      return;
    }
    this.openSnackBar('Submitted','Dismiss')
    responses[this.playerId] = this.response;

    if (this.playerId === this.game()?.judge) {
      this.displayedPrompt = this.response;
    }

    this.httpClient
      .put<Game>(`/api/game/edit/${gameId}`, { $set: { responses: responses } })
      .subscribe();

    this.response = '';
    this.shuffleArray();
  }
  submission = "";
  response = ""
  username = " ";
  usernameInput: string = "";
  playerIdInput: string = "";
  numPlayers: number = 0;
  //isPromptSubmitted: boolean = false;
  displayedPrompt: string = '';
  responses: string[] = []; // Initialize responses as an empty array

  submitUsername() {
    if (this.usernameInput.trim()) {
      this.playerId = this.game().players.length;
      this.username = this.usernameInput.trim(); // Update the displayed username
      const gameId = this.game()?._id;
      const scores = this.game()?.scores;
      scores.push(0);
      const responses = this.game()?.responses;
      responses.push("");
      const players = this.game()?.players;
      players.push(this.username);
      const connectedPlayers = this.game()?.connectedPlayers;
      let playersIn = false;
      for(let i = 0; i < this.game()?.connectedPlayers.length; i++) {
        {
          if(this.game()?.connectedPlayers[i] == true) {
            playersIn = true;
            break;
          }
        }
      }
      connectedPlayers.push(true);
      if(!playersIn) {
        this.game().judge = this.playerId;
      }

      // Set the first player as the judge
      let judge = this.game()?.judge;
      if (this.playerId === 0) {
        judge = 0;
      }

      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {
        $set: { players: players, scores: scores, responses: responses, judge: judge, connectedPlayers: connectedPlayers }
      }).subscribe();

      this.numPlayers = this.players.length; // Update the number of players
      //console.log(this.players); // players name
      //console.log(this.numPlayers); // number of players
      //console.log(this.game()); // game object
    }
  }

  submitPlayerId() {
    if (parseInt(this.playerIdInput.trim()) <= this.game()?.players.length && parseInt(this.playerIdInput.trim()) > 0 && this.game().connectedPlayers[parseInt(this.playerIdInput.trim())-1] == false) {
      let playersIn = false;
      for(let i = 0; i < this.game()?.connectedPlayers.length; i++) {
        {
          if(this.game()?.connectedPlayers[i] == true) {
            playersIn = true;
            break;
          }
        }
      }
      this.playerId = parseInt(this.playerIdInput.trim()) - 1;
      this.openSnackBar('Rejoined game', 'Dismiss');
      const gameId = this.game()?._id;
      const connectedPlayers = this.game()?.connectedPlayers;
      connectedPlayers[this.playerId] = true;
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{connectedPlayers: connectedPlayers}}).subscribe();
      if(!playersIn) {
        this.game().judge = this.playerId;
      }
      const judge = this.game()?.judge;
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{judge: judge}}).subscribe();
    } else if(this.game().connectedPlayers[parseInt(this.playerIdInput.trim())-1] == true) {
      this.openSnackBar('ID occupied by another player', 'Dismiss');
    } else {
      this.openSnackBar('ID is not valid. ', 'Dismiss');
    }
  }
  _id: string = ""; // Game ID
  playerId: number;
  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name
  playerPerm: number[] = [];

  getResponses() {
    const array: string[] = [];
    for (let i = 0; i < this.playerPerm.length; i++) {
      if (this.game()?.connectedPlayers[this.playerPerm[i]]) {
        array.push(this.game()?.responses[this.playerPerm[i]]);
      }
    }
    return array;
  }

  shuffleArray() {
    this.playerPerm = [];
    for (let i = 0; i < this.game()?.players.length; i++) {
      if (i != this.game()?.judge && this.game()?.connectedPlayers[i])
        this.playerPerm.push(i);
    }
    for (let i = this.playerPerm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playerPerm[i], this.playerPerm[j]] = [this.playerPerm[j], this.playerPerm[i]];
    }
  }

  selectResponse(i) {
    const gameId = this.game()?._id;
    const scores = this.game()?.scores;
    const pastResponses = this.game()?.pastResponses || [];
    scores[this.playerPerm[i]]++;

    // Append all responses to pastResponses
    for (let j = 0; j < this.game()?.responses.length; j++) {
      pastResponses[j] = this.game()?.responses[j];
    }

    // Clear the responses array for the next round
    const responses: Array<string> = [];
    for (let j = 0; j < this.game()?.responses.length; j++) {
      responses.push("");
    }

    // Reset the displayed responses array
    this.game().responses = responses;

    // Update the game state on the server
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {
      $set: { pastResponses: pastResponses, scores: scores, responses: responses }
    }).subscribe(() => {
      const winnerBecomesJudge = this.game()?.winnerBecomesJudge;

      if (winnerBecomesJudge) {
        //console.log("Winner becomes judge");
        const newJudge = this.playerPerm[i]; // The index of the selected response becomes the new judge
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      } else {
        let newJudge = (this.game()?.judge + 1) % this.game()?.players.length; // Increment judge to the next player
        while(this.game().connectedPlayers[newJudge] == false) {
          newJudge = (newJudge + 1) % this.game()?.players.length;
        }
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      }
      if (scores[this.playerPerm[i]] >= this.game()?.targetScore) {
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { gameOver: true } }).subscribe(() => {
          this.game().gameOver = true; // Update the local game object
          //console.log(`Game over set to true`);
        });
      }
      this.socket.send('ping');
    });
  }

  responsesReady() {
    for (let i = 0; i < this.game()?.players.length; i++) {
      if (this.game()?.responses[i] == "" && this.game()?.connectedPlayers[i] && i <= this.playerPerm?.length) {
        return false;
      }
    }
    return true;
  }
  leaveGame() {
    const gameId = this.game()?._id;
    const connectedPlayers = this.game()?.connectedPlayers;
    connectedPlayers[this.playerId] = false;
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { connectedPlayers: connectedPlayers } }).subscribe(() => {
    });
    let connectedPlayerID = this.playerId;
    let judge = this.game()?.judge;
    let playersIn = false;
    for(let i = 0; i < this.game()?.connectedPlayers.length; i++) {
      {
        if(this.game()?.connectedPlayers[i] == true) {
          playersIn = true;
          break;
        }
      }
    }
    if(this.playerId == judge && playersIn) {
      while(!this.game().connectedPlayers[connectedPlayerID]) {
        connectedPlayerID = (connectedPlayerID + 1) % this.game().connectedPlayers.length;
      }
    }
    if(this.game().connectedPlayers[connectedPlayerID]) {
      judge = connectedPlayerID;
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: judge } }).subscribe(() => {
        this.game().judge = judge;
        console.log(`Judge updated to player index: ${judge}`);
      });
    }
    this.socket.send('ping');
    console.log('User left the game');
    this.router.navigate(['/']);
  }

  leavePage() {
    this.router.navigate(['/']);
  }
}
