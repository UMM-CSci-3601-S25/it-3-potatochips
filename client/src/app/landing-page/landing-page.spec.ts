import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './landing-page';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

describe('HomeComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatListModule,
        HttpClientModule,
        HomeComponent
      ],
    }).compileComponents();
  }));

  it('should create landing page', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a button to join a game', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const joinButton = fixture.debugElement.query(By.css('routerLink="/game/{{joinId}}'));
    expect(joinButton).toBeTruthy();
    expect(joinButton.nativeElement.textContent).toContain('Join Game');
  });
});
