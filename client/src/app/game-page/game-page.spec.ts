import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core'; // Import signal for mocking Signal<Game>
import { GameComponent } from './game-page';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        HttpClientTestingModule,
        GameComponent // Import GameComponent instead of declaring it
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => 'test-id'
            }),
            queryParams: of({}),
            fragment: of(''),
            data: of({}),
            url: of([]),
            outlet: 'primary',
            routeConfig: {},
            parent: null,
            firstChild: null,
            children: [],
            pathFromRoot: [],
            root: null,
            snapshot: {
              paramMap: {
              }
            }
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    component.prompt = ''; // Initialize the prompt property
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize prompt property correctly', () => {
    expect(component.prompt).toBe('');
  });

  it('should update prompt property', () => {
    const newPrompt = 'New Test Prompt';
    component.prompt = newPrompt;
    fixture.detectChanges();
    expect(component.prompt).toBe(newPrompt);
  });

  it('should handle route parameters correctly', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.paramMap.subscribe(params => {
      expect(params.get('id')).toBe('test-id');
    });
  });

  it('should update responses and handle judge response in submitResponse', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: [null, null], // Ensure responses array is initialized
      judge: 1
    };
    component.game = signal(mockGame); // Use signal to mock Signal<Game>
    component.playerId = 1;
    component.response = 'Test Response';

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callThrough();
    const shuffleArraySpy = spyOn(component, 'shuffleArray').and.callFake(() => {
      const array = mockGame.responses; // Access the array directly
      expect(array).toBeDefined(); // Ensure array is defined
      expect(array.length).toBeGreaterThan(0); // Ensure array has elements
    });

    component.submitResponse();

    expect(component.game().responses[1]).toBe('Test Response');
    expect(component.displayedPrompt).toBe('Test Response'); // Judge's response becomes the prompt
    expect(component.response).toBe(''); // Input field is cleared
    expect(httpClientSpy).toHaveBeenCalledWith(
      `/api/game/edit/test-game-id`,
      { $set: { responses: component.game().responses } }
    );
    expect(shuffleArraySpy).toHaveBeenCalled();
  });

  it('should shuffle playerPerm array correctly in shuffleArray', () => {
    const mockGame = {
      _id: 'mock-game-id', // Add the required _id property
      players: ['Player1', 'Player2', 'Player3', 'Player4'],
      judge: 0
    };
    component.game = signal(mockGame); // Mock the game object
    component.shuffleArray();

    expect(component.playerPerm).toBeDefined();
    expect(component.playerPerm.length).toBe(mockGame.players.length - 1); // Exclude the judge
    expect(component.playerPerm).not.toContain(mockGame.judge); // Ensure judge is excluded
    const uniqueValues = new Set(component.playerPerm);
    expect(uniqueValues.size).toBe(component.playerPerm.length); // Ensure no duplicates
  });
});
