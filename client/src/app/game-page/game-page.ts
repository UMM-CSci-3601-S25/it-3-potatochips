import { Component, signal } from '@angular/core';
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
    CommonModule // Add CommonModule to imports
  ]
})
export class GameComponent {
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

  submitPrompt() {
    const gameId = this.route.snapshot.paramMap.get('id');
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{prompt: this.submission}}).subscribe();
    //console.log(this.submission);
    this.isPromptSubmitted = true; // Mark the prompt as submitted
    this.displayedPrompt = this.submission; // Store the submitted prompt
    this.submission = ''; // Clear the input field
  }

  submitResponse() {
    const gameId = this.route.snapshot.paramMap.get('id');
    this.responses.push(this.response); // Add the new response to the array
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{responses: this.responses}}).subscribe();
    //console.log(this.response);
    //console.log(this.responses);
  }

  onResponseClick(response: string) {
    console.log(`Response clicked: ${response}`);
    // Add any additional logic for handling the clicked response here
  }

  submission = "";
  responses: string[] = [];
  response = ""
  username = " ";
  usernameInput: string = "";
  numPlayers: number = 0;
  isPromptSubmitted: boolean = false;
  displayedPrompt: string = '';

  submitUsername() {
    if (this.usernameInput.trim()) {
      this.username = this.usernameInput.trim(); // Update the displayed username
      const gameId = this.route.snapshot.paramMap.get('id');
      const scores = this.game()?.scores.push(0);
      const responses = this.game()?.responses.push("");
      const players = this.game()?.players.push(this.username);
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{players: players, scores: scores, responses: responses}}).subscribe();
      this.numPlayers = this.players.length; // Update the number of players
      //console.log(this.players); // players name
      //console.log(this.numPlayers); // number of players
      console.log(this.game()); // game object
    }
  }

  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name

  selectResponse(i) {
    const gameId = this.route.snapshot.paramMap.get('id');
    const scores = this.game()?.scores;
    scores[i]++;
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{scores: scores}}).subscribe();
  }

  nextJudge() {
    const gameId = this.route.snapshot.paramMap.get('id');
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{judge: this.numPlayers}}).subscribe();
    this.numPlayers = this.players.length; // Update the number of players
    console.log(this.numPlayers); // number of players
  }


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {}

}
