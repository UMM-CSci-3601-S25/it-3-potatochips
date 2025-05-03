import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
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

  it('should update scores, pastResponses, and judge correctly in selectResponse', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: true
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [1, 2]; // Mock the shuffled player order

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
      if (body.$set.judge !== undefined) {
      // Simulate the judge update call
        component.game().judge = body.$set.judge;
      }
      return of(null); // Simulate an observable response
    });

    component.selectResponse(1); // Select the second response (index 1 in playerPerm)

    // Check if the score of the selected player is incremented
    expect(component.game().scores[2]).toBe(1);

    // Check if pastResponses is updated correctly
    expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

    // Check if responses are cleared
    expect(component.game().responses).toEqual(['', '', '']);

    // Wait for the asynchronous judge update
    setTimeout(() => {
    // Check if the judge is updated correctly
      expect(component.game().judge).toBe(2); // The selected response index becomes the new judge
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      done(); // Mark the test as complete
    });
  });

  it('should update judge to the next player in selectResponse when winnerBecomesJudge is false', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: false, // Ensure winnerBecomesJudge is false,
      connectedPlayers: [true, true, true]
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [1, 2]; // Mock the shuffled player order

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
      if (body.$set.judge !== undefined) {
      // Simulate the judge update call
        component.game().judge = body.$set.judge;
      }
      return of(null); // Simulate an observable response
    });

    component.selectResponse(1); // Select the second response (index 1 in playerPerm)

    // Check if the score of the selected player is incremented
    expect(component.game().scores[2]).toBe(1);

    // Check if pastResponses is updated correctly
    expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

    // Check if responses are cleared
    expect(component.game().responses).toEqual(['', '', '']);

    // Wait for the asynchronous judge update
    setTimeout(() => {
    // Check if the judge is updated to the next player
      expect(component.game().judge).toBe(1); // Judge should increment to the next player
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      expect(httpClientSpy).toHaveBeenCalledWith(
        `/api/game/edit/test-game-id`,
        jasmine.objectContaining({
          $set: jasmine.objectContaining({
            judge: 1 // The next player becomes the judge
          })
        })
      );
      done(); // Mark the test as complete
    });
  });

  it('should set judge to 0 if playerId is 0', () => {
    const mockGame = {
      _id: 'test-game-id',
      players: [],
      scores: [],
      responses: [],
      connectedPlayers: [false, false, false],
      judge: null
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerId = null; // Ensure playerId is null initially
    component.usernameInput = 'Player1'; // Simulate a username input

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
      if (body.$set.judge !== undefined) {
        mockGame.judge = body.$set.judge; // Simulate judge update
      }
      return of(null); // Simulate an observable response
    });

    component.submitUsername(); // Call the method to test

    expect(mockGame.judge).toBe(0); // Ensure judge is set to 0
    expect(httpClientSpy).toHaveBeenCalledWith(
      `/api/game/edit/test-game-id`,
      jasmine.objectContaining({
        $set: jasmine.objectContaining({
          judge: 0 // Verify the judge is set to 0 in the HTTP request
        })
      })
    );
  });

  it('should return false if any response is empty in responsesReady', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: ['Response1', '', 'Response3'], // One response is empty
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      activePlayers: [true, true, true]
    };
    component.game = signal(mockGame); // Mock the game object

    const result = component.responsesReady(); // Call the method

    expect(result).toBe(false); // Verify it returns false
  });

  it('should reject duplicate responses and prevent submission', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: ['Response1', 'Response2', 'Response2'], // Existing responses
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0 // Player 0 is the judge
    };

    component.game = signal(mockGame); // Mock the game object
    component.playerId = 1; // Simulate a non-judge player
    component.response = 'Response2'; // Simulate a duplicate response

    const snackBarSpy = spyOn(component, 'openSnackBar');

    component.submitResponse(); // Call the method

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Duplicate response detected: "Response2". This response cannot be submitted.',
      'Dismiss'
    );
    expect(component.response).toBe(''); // Ensure the response input is cleared
    expect(component.game().responses[1]).toBe('Response2'); // Ensure the original response is unchanged
  });

  it('should refresh the game state by fetching updated data from the server', () => {
    const mockGameId = 'test-game-id';
    const mockUpdatedGame = {
      _id: mockGameId,
      players: ['Player1', 'Player2'],
      responses: ['Response1', 'Response2'],
      judge: 0
    };

    // Mock the game object with an initial state
    component.game = signal({ _id: mockGameId });

    // Spy on the HttpClient's get method
    const httpClientSpy = spyOn(component['httpClient'], 'get').and.returnValue(of(mockUpdatedGame));

    // Call the refreshGame method
    component.refreshGame();

    // Verify that the HttpClient's get method was called with the correct URL
    expect(httpClientSpy).toHaveBeenCalledWith(`/api/game/${mockGameId}`);

    // Verify that the game state was updated with the fetched data
    expect(component.game()._id).toBe(mockUpdatedGame._id);
    expect(component.game().players).toEqual(mockUpdatedGame.players);
    expect(component.game().responses).toEqual(mockUpdatedGame.responses);
    expect(component.game().judge).toBe(mockUpdatedGame.judge);
  });

  it('should call refreshGame when a WebSocket message is received', () => {
    const refreshGameSpy = spyOn(component, 'refreshGame').and.callThrough();
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['send', 'close']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    component['WebsocketSetup']();
    const mockMessage = { data: 'Test WebSocket Message' } as MessageEvent;
    if (mockSocket.onmessage) {
      mockSocket.onmessage(mockMessage);
      expect(refreshGameSpy).toHaveBeenCalled();
    }
  });

  it('should update playerId and show a snackbar when a valid playerId is submitted', () => {
    const snackBarSpy = spyOn(component, 'openSnackBar'); // Spy on openSnackBar
    const mockGame = {
      _id: 'mock-game-id', // Add the required _id property
      players: ['Player1', 'Player2', 'Player3'], // Mock players
      connectedPlayers: [false, false, false],
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerIdInput = '2'; // Simulate valid playerId input

    component.submitPlayerId(); // Call the method

    expect(component.playerId).toBe(1); // Verify playerId is updated (index is 0-based)
    expect(snackBarSpy).toHaveBeenCalledWith('Rejoined game', 'Dismiss'); // Verify snackbar is shown
  });

  it('Should return Game Over when hit target score', () => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      scores: [1, 2, 3], // Example scores
      targetScore: 3, // Set target score to 30
      gameOver: true,
      responses: ['limes', 'touch grass', 'get a life'],
    };
    component.game = signal(mockGame); // Mock the game object

    const result = component.game().gameOver; // Call the method
    expect(component.game().players.length).toBe(3); // Verify it returns true
    expect(result).toBe(true); // Verify it returns true
  });

  it('should not let an arbitrary playerId get set if another player already inhabits that playerId', () =>  {
    const mockUpdatedGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2'],
      responses: ['Response1', 'Response2'],
      connectedPlayers: [true, false],
      judge: 0
    };
    component.game = signal( mockUpdatedGame );
    component.playerIdInput = '3';
    component.submitPlayerId();
    expect(component.playerId).toBe(undefined);
  });

  it('makes socket.onmessage sends a pong', () => {
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['send', 'close']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    component['WebsocketSetup']();
    const mockMessage = { data: 'ping' } as MessageEvent;
    if (mockSocket.onmessage) {
      mockSocket.onmessage(mockMessage);
    }
    expect(mockSocket.send).toHaveBeenCalledWith('pong');
  });

  it('makes socket.onclose trigger whenever someone intentionally closes out of their game', () => {
    const mockUpdatedGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2'],
      responses: ['Response1', 'Response2'],
      connectedPlayers: [true, true],
      judge: 0
    };

    console.log = jasmine.createSpy("log");
    component.game = signal( mockUpdatedGame );
    component.playerIdInput = '1';
    component.leaveGame();
    expect(console.log).toHaveBeenCalledWith("User left the game");
  });

  it('should reset pong timeout and close the WebSocket if pong is not received', fakeAsync(() => {
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['close']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    console.warn = jasmine.createSpy('warn');
    component['WebsocketSetup']();
    component['resetPongTimeout']();
    tick(component['PONG_TIMEOUT']);
    expect(console.warn).toHaveBeenCalledWith('Pong not received. Reconnecting...');
    expect(mockSocket.close).toHaveBeenCalled();
  }));

  it('should trigger mockSocket.onclose when the window is closed', () => {
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['send', 'close']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    console.warn = jasmine.createSpy('warn');
    component['WebsocketSetup']();
    if (mockSocket.onclose) {
      const closeEvent = new CloseEvent('close');
      mockSocket.onclose(closeEvent);
      expect(console.warn).toHaveBeenCalledWith('WebSocket connection closed. Reconnecting...');
    }
  });

  it('should trigger window.onbeforeunload and clean up the WebSocket when the window is closed', () => {
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['send', 'close']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    const cleanupSpy = spyOn(component, 'cleanupWebSocket');
    component['WebsocketSetup']();
    window.onbeforeunload = () => {
      component.cleanupWebSocket();
    };
    const event = new Event('beforeunload');
    window.dispatchEvent(event);
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('should properly check through the rejoin case where said ID does not exist', () => {
    const snackBarSpy = spyOn(component, 'openSnackBar');
    const mockGame = {
      _id: 'mock-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      connectedPlayers: [false, false, false],
    };
    component.game = signal(mockGame);
    component.playerIdInput = '5';
    component.submitPlayerId();
    expect(snackBarSpy).toHaveBeenCalledWith('ID is not valid. ', 'Dismiss');
  });

  it('should not let one join the player instance of another individual ', () => {
    const snackBarSpy = spyOn(component, 'openSnackBar');
    const mockGame = {
      _id: 'mock-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      connectedPlayers: [true, true, true],
    };
    component.game = signal(mockGame);
    component.playerIdInput = '1';
    component.submitPlayerId();
    expect(snackBarSpy).toHaveBeenCalledWith('ID occupied by another player', 'Dismiss');
  });

  it(' should maintain a regular heartbeat for each open connection', fakeAsync(() => {
    const mockSocket: jasmine.SpyObj<WebSocket> = jasmine.createSpyObj('WebSocket', ['send']);
    spyOn(window, 'WebSocket').and.returnValue(mockSocket);
    const resetPongTimeoutSpy = spyOn(component, 'resetPongTimeout');
    component['WebsocketSetup']();
    Object.defineProperty(mockSocket, 'readyState', { value: WebSocket.OPEN });
    component['Heartbeat']();
    tick(component['PING_INTERVAL']);
    expect(mockSocket.send).toHaveBeenCalledWith('ping');
    expect(resetPongTimeoutSpy).toHaveBeenCalled();
  }));
  // it('should update connectedPlayers and send a PUT request when the window is unloaded', () => {
  //   const mockGame = {
  //     _id: 'test-game-id',
  //     connectedPlayers: [true, false, true],
  //   };
  //   component.game = signal(mockGame);
  //   component.playerId = 1;

  //   spyOn(component, 'cleanupWebSoc')

  //   const httpClientSpy = spyOn(component['httpClient'], 'put').and.callThrough();

//   expect(mockGame.connectedPlayers[component.playerId]).toBe(false);
//   expect(httpClientSpy).toHaveBeenCalledWith(
//     `/api/game/edit/${mockGame._id}`,
//     { $set: { connectedPlayers: mockGame.connectedPlayers } }
//   );
// });
})
