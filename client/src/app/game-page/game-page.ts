// import { Component, OnDestroy, OnInit, signal } from '@angular/core';
// import { MatCardModule } from '@angular/material/card';
// import { ActivatedRoute, ParamMap } from '@angular/router';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// //import { toObservable } from '@angular/core/rxjs-interop';
// import { FormsModule } from '@angular/forms';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { Game } from '../game';
// import { catchError, map, switchMap } from 'rxjs/operators';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { of, Subscription } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common'; // Import CommonModule
// import { WebSocketService } from './web-socket.service';

// @Component({
//   selector: 'app-game-page',
//   templateUrl: 'game-page.html',
//   styleUrls: ['./game-page.scss'],
//   providers: [],
//   imports: [
//     MatCardModule,
//     MatInputModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     FormsModule,
//     MatCheckboxModule,
//     CommonModule // Add CommonModule to imports
//   ]
// })
// export class GameComponent implements OnInit, OnDestroy {
//   prompt: string = ''; // Initialize the prompt property
//   game = toSignal(
//     this.route.paramMap.pipe(
//       // Map the paramMap into the id
//       map((paramMap: ParamMap) => paramMap.get('id')),
//       switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
//       catchError((_err) => {
//         this.error.set({
//           help: 'There was a problem loading the game – try again.',
//           httpResponse: _err.message,
//           message: _err.error?.title,
//         });
//         return of();
//       })

//     ));
//   error = signal({help: '', httpResponse: '', message: ''});

//   submission = "";
//   responses: string[] = [];
//   response = ""
//   username = " ";
//   usernameInput: string = "";
//   numPlayers: number = 0;
//   isPromptSubmitted: boolean = false;
//   disPlayedPrompt: string = '';
//   players: string[] = [];
//   newPlayer: string = "";
//   playerScores: { [key: string]: number } = {};
//   isConnected: boolean = false; // This will help track connection
//   private connectionSubscription: Subscription | undefined; // This is a Subscription for connection status

//   constructor(
//     private route: ActivatedRoute,
//     private httpClient: HttpClient,
//     private webSocketService: WebSocketService //Injecting the WebSocketService
//   ) {}
//   ngOnInit(): void {
//     this.connectionSubscription = this.webSocketService.getConnectionStatus().subscribe(status => {
//       this.isConnected = status;
//       console.log('WebSocket Connection Status:', this.isConnected);
//       // I will add more logic fo informing the user about the connection status,
//       // like displaying a message if not connected
//     })
//   }
//   ngOnDestroy(): void {
//     if (this.connectionSubscription) {
//       this.connectionSubscription.unsubscribe();
//     }
//   }

//   submitPrompt() {
//     const gameId = this.route.snapshot.paramMap.get('id');
//     this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{prompt: this.submission}}).subscribe();
//     console.log(this.submission);
//     this.isPromptSubmitted = true; // Mark the prompt as submitted
//     this.disPlayedPrompt= this.submission; // Store the submitted prompt
//     this.submission = ''; // Clear the input field
//   }

//   submitResponse() {
//     const gameId = this.route.snapshot.paramMap.get('id');
//     this.responses.push(this.response); // Add the new response to the array
//     this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{responses: this.responses}}).subscribe();
//     //console.log(this.response);
//     //console.log(this.responses);
//   }

//   // submission = "";
//   // responses: string[] = [];
//   // response = ""
//   // username = " ";
//   // usernameInput: string = "";
//   // numPlayers: number = 0;
//   // isPromptSubmitted: boolean = false;
//   // displayedPrompt: string = '';

//   submitUsername() {
//     if (this.usernameInput.trim()) {
//       //console.log(this.players.length); // numbers of players before
//       this.username = this.usernameInput.trim(); // Update the displayed username
//       this.players.push(this.username); // Add the username to the players array
//       const gameId = this.route.snapshot.paramMap.get('id');
//       this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{players: this.players}}).subscribe();
//       this.numPlayers = this.players.length; // Update the number of players
//       //console.log(this.players); // players name
//       //console.log(this.numPlayers); // number of players
//     }
//   }

//   // players: string[] = []; // Array to store player names with scores
//   // newPlayer: string = ""; // Input for new player name
//   // playerScores: { [key: string]: number } = {}; // Track scores for each player

//   // constructor(
//   //   private route: ActivatedRoute,
//   //   private httpClient: HttpClient
//   // ) {}

// }


import { Component, Inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
//import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Game } from '../game';
import { catchError, map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { WebSocketService } from './web-socket.service';


@Component({
  selector: 'app-game-page',
  templateUrl: 'game-page.html',
  styleUrls: ['./game-page.scss'],
  providers: [WebSocketService],
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    CommonModule // Add CommonModule to imports
  ]
})
export class GameComponent {
  webSocketService = Inject(WebSocketService);
  prompt: string = ''; // Initialize the prompt property
  game = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the game – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })

    ));
  error = signal({help: '', httpResponse: '', message: ''});

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
    const responses = this.game()?.responses || []; // Ensure responses is defined
    responses[this.playerId] = this.response; // Add the new response to the array

    // Ensure the judge's response is treated as the prompt
    if (this.playerId === this.game()?.judge) {
      this.displayedPrompt = this.response; // Store the judge's response as the prompt
    }

    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { responses: responses } }).subscribe();
    this.response = ''; // Clear the input field
<<<<<<< HEAD
    this.shuffleArray();

    const message = {
      gameId: this.game()?._id,
      responses: this.game()?.responses,
      pastResponses:this.game()?.pastResponses,
      judge: this.game()?.judge,

    };
    this.webSocketService.sendMessage(message);
=======
>>>>>>> main
  }
  submission = "";
  response = ""
  username = " ";
  usernameInput: string = "";
  numPlayers: number = 0;
  //isPromptSubmitted: boolean = false;
  displayedPrompt: string = '';
  responses: string[] = []; // Initialize responses as an empty array

  submitUsername() {
    if (this.usernameInput.trim()) {
      this.playerId = this.game().players.length;
      this.username = this.usernameInput.trim(); // Update the displayed username
      const gameId = this.game()?._id;
      const scores = this.game()?.scores.push(0);
      const responses = this.game()?.responses.push("");
      const players = this.game()?.players.push(this.username);

      // Set the first player as the judge
      let judge = this.game()?.judge;
      if (this.playerId === 0) {
        judge = 0;
      }

      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {
        $set: { players: players, scores: scores, responses: responses, judge: judge }
      }).subscribe();

      this.numPlayers = this.players.length; // Update the number of players
      //console.log(this.players); // players name
      //console.log(this.numPlayers); // number of players
<<<<<<< HEAD
      //console.log(this.game()); // game object
    }
    const message = {
      playerId: this.playerId,
      username: this.username,
      gameId: this.game()?._id, //This may be where the issue lies for a problem
      scores: this.game()?.scores.push(0), //This may be where the issue lies for a problem
      responses: this.responses,
      players: this.players,
      judge: this.game()?.judge //This may be where the issue lies for a problem
    };
    this.webSocketService.sendMessage(message);

  }

  playerId: number;
  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name
  playerPerm: number[] = [];

  getResponses() {
    const array: string[] = [];
    for (let i = 0; i < this.playerPerm.length; i++) {
      array.push(this.game()?.responses[this.playerPerm[i]]);
    }
    return array;
  }

  shuffleArray() {
    this.playerPerm = [];
    for (let i = 0; i < this.game()?.players.length; i++) {
      if (i != this.game()?.judge)
        this.playerPerm.push(i);
    }
    for (let i = this.playerPerm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playerPerm[i], this.playerPerm[j]] = [this.playerPerm[j], this.playerPerm[i]];
    }
  }

=======
      console.log(this.game()); // game object
    }
  }

  playerId: number;
  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name

  getResponses() {
    return this.game()?.responses;
  }

>>>>>>> main
  selectResponse(i) {
    const gameId = this.game()?._id;
    const scores = this.game()?.scores;
    const pastResponses = this.game()?.pastResponses || [];
<<<<<<< HEAD
    scores[this.playerPerm[i]]++;
=======
    scores[i]++;
>>>>>>> main

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
<<<<<<< HEAD
    }).subscribe(() => {
      const winnerBecomesJudge = this.game()?.winnerBecomesJudge;

      if (winnerBecomesJudge) {
        //console.log("Winner becomes judge");
        const newJudge = i; // The index of the selected response becomes the new judge
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      } else {
        const newJudge = (this.game()?.judge + 1) % this.game()?.players.length; // Increment judge to the next player
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      }
    });
=======
    }).subscribe();

    const winnerBecomesJudge = this.game()?.winnerBecomesJudge;

    if (winnerBecomesJudge) {
      console.log("Winner becomes judge");
      // Logic for winner becoming the judge
    } else {
      console.log("Winner does not become judge");
      const judge = ((this.game()?.judge + 1) % this.game()?.players.length);
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: judge } }).subscribe();
      console.log(this.game()?.judge); // game object
    }
>>>>>>> main
  }

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,


  ) {
    // this.webSocketService.getMessage().subscribe((message: unknown) => {
    //   const msg = message as {
    //   type?: string;
    //   gameId?: string;
    //   playerName?: string;

    //     players?: string[];
    //     prompt?: string;
    //     responses?: string[];
    //     judge?: number;
    //     scores?: number;
    //     winnerBecomesJudge?: boolean;
    //     pastResponses?: string[];

    //   }
    //   };
  // Handle other message types or logic here
    // });
  }
}
