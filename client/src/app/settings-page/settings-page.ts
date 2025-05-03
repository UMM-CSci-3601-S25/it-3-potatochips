import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, ActivatedRoute, ParamMap } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { catchError, map, of, switchMap } from 'rxjs';
import { Game } from '../game';
import { HttpClient } from '@angular/common/http';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-page',
  templateUrl: 'settings-page.html',
  styleUrls: ['./settings-page.scss'],
  providers: [],
  imports: [MatCardModule, RouterLink, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule, MatCheckboxModule, MatSlideToggleModule, ClipboardModule, MatSnackBarModule, MatIconModule],
})
export class SettingsComponent {


  judgeOption = signal<boolean | undefined>(false);
  private judgeOption$ = toObservable(this.judgeOption);
  // default = 'false';
  private snackBar = inject(MatSnackBar);


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action,{
      duration: 3000, // Duration in milliseconds
    });
  }

  game = toSignal(
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was problem loading the game - try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })
    )
  );
  error = signal({help: '', httpResponse: '', message: ''});

  constructor (
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {}


  updateGameSettings() {
    // const winnerBecomesJudge = { winnerBecomesJudge: this.judgeOption() };
    console.log(this.judgeOption());
    const gameId = this.game()?._id;
    if (gameId) {
      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{winnerBecomesJudge: this.judgeOption(), targetScore: this.scoreThreshold()}}).subscribe();
    }
  }

  scoreThreshold = signal<number | undefined>(7);
}
