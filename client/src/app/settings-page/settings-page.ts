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

@Component({
  selector: 'app-settings-page',
  templateUrl: 'settings-page.html',
  styleUrls: ['./settings-page.scss'],
  providers: [],
  imports: [MatCardModule, RouterLink, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule, MatCheckboxModule]
})
export class SettingsComponent {
  judgeOption = signal<string | undefined>(undefined);
  private judgeOption$ = toObservable(this.judgeOption);
  default = 'cycle';
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


  // This is a signal that will be used to update the game settings, currently does not work, talks with GameController.java
  discardLast = signal<boolean>(false);

  updateGameSettings() {
    const updatedSettings = {
      judgeOption: this.judgeOption(),
      discardLast: this.discardLast(),
    };

    const gameId = this.game()?._id;
    if (gameId) {
      this.httpClient.put(`/api/game/edit/${gameId}`, updatedSettings).subscribe({
        next: () => {
          console.log('Game settings updated successfully');
        },
      });
    }
  }

}
