import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatListModule,
        FormsModule,
        HomeComponent,
        HttpTestingController
      ],
      providers: [provideHttpClientTesting()],
    }).compileComponents();
  }));

  it('should create landing page', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call createGame when Create New Game button is clicked', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'createGame');
    const createButton = fixture.debugElement.query(By.css('button#create-game'));
    createButton.triggerEventHandler('click', null);
    expect(component.createGame).toHaveBeenCalled();
  });

  it('should have a Join Game button', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const joinButton = fixture.debugElement.query(By.css('button#join-game'));
    expect(joinButton).toBeTruthy();
  });

  it('should call createGame and send the correct payload', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    const routerSpy = spyOn(component['router'], 'navigateByUrl');
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
