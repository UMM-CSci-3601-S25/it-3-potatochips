import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Game } from '../game';
import { map } from 'rxjs';



@Component({
  selector: 'app-landing-page',
  templateUrl: 'landing-page.html',
  styleUrls: ['./landing-page.scss'],
  providers: [],
  imports: [MatCardModule, RouterLink, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule]
})
export class HomeComponent {
  constructor(private httpClient: HttpClient, private router: Router) {
  }

  joinId = "";

  createGame() {
    console.info("createGame() called");
    const newGame: Partial<Game> = {  "players": [],   "judge": 0, "winnerBecomesJudge": false, "responses": [], "scores":[], "pastResponses":[]};
    console.info(newGame);
    this.httpClient.post<{id: string}>('/api/game/new', newGame).pipe(map(response => response.id)).subscribe({
      next: (newId) => {
        this.router.navigateByUrl('/settings/' + newId);
      }
    });
  }
}
