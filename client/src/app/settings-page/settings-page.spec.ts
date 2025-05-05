import { TestBed, waitForAsync, ComponentFixture} from '@angular/core/testing'; // Import ComponentFixture
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SettingsComponent } from './settings-page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Game } from '../game'; // Import the Game interface
import { signal } from '@angular/core'; // Import signal from Angular
describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>; // Explicitly type fixture
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        RouterTestingModule,
        HttpClientTestingModule,
        SettingsComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '12345' }) // Mock route parameter
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    const mockGame: Game = { _id: '12345' } as Game;
    const getReq = httpMock.expectOne('/api/game/12345');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockGame);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a PUT request with the correct payload when updateGameSettings is called', () => {
    // Mock the GET request for the game signal
    const mockGame: Game = { _id: '12345' } as Game;

    // Mock the game signal to return a valid game object
    component.game = signal<Game | undefined>(mockGame);

    // Set the judgeOption signal value
    component.judgeOption.set(true);

    // Call the method
    component.updateGameSettings();

    // Expect an HTTP PUT request
    const putReq = httpMock.expectOne('/api/game/edit/12345');
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({ $set:
      { winnerBecomesJudge: true,
        targetScore: 7,
      } });


    // Respond to the PUT request to complete it
    putReq.flush({});
  });

  it('should open a snackbar with the correct message and action', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open'); // Spy on MatSnackBar's open method
    const message = 'Test Message';
    const action = 'Test Action';

    component.openSnackBar(message, action); // Call the method

    // Verify that the snackbar is opened with the correct parameters
    expect(snackBarSpy).toHaveBeenCalledWith(message, action, { duration: 3000 });
  });


});
