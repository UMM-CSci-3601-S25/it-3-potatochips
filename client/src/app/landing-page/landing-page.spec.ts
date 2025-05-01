import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './landing-page';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatListModule,
        FormsModule,
        RouterModule.forRoot([
          { path: 'game/new', component: HomeComponent }
        ]),
        HomeComponent,
      ],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController);
  });

  it('should call createGame when Create New Game button is clicked', () => {
    spyOn(component, 'createGame');
    const createButton = fixture.debugElement.query(By.css('button#create-game'));
    createButton.triggerEventHandler('click', null);
    expect(component.createGame).toHaveBeenCalled();
  });

  it('should have a Join Game button', () => {
    const joinButton = fixture.debugElement.query(By.css('button#join-game'));
    expect(joinButton).toBeTruthy();
  });

  it('should call createGame and send the correct payload', () => {
    //const routerSpy = spyOn(component['router'], 'navigateByUrl');
    component.createGame();
    const httpMock = TestBed.inject(HttpTestingController);
    const req = httpMock.expectOne('/api/game/new');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      players: [],
      judge: 0,
      winnerBecomesJudge: false,
      responses: [],
      scores: [],
      pastResponses: []
    });
    httpMock.verify();
  });
});
