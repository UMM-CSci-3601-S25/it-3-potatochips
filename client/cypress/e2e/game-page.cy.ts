import { GamePage } from '../support/game-page.po';
import { environment } from '../../src/environments/environment'

const page = new GamePage();

describe('Game page', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  // it('Should create game', () => {
  //   page.createGame().click();
  //   cy.url().should(url => expect(url.includes('')).to.be.true);
  // });

  it('Should include id', () => {
    cy.url().should(url => expect(url.includes('681266ce536e072b01791cb6')).to.be.true);
  });

  it('Should show all four players for this game', () => {
    page.getPlayers().should('have.lengthOf', 4);
  });

  it('Should update the list of players when one is added', () => {
    // I thought this task was needed, but it doesn't seem like it is necessary.
    // cy.task("connect");
    page.getPlayers().should('have.lengthOf', 4);
    cy.request(
      'PUT',
      `${environment.apiUrl}game/edit/681266ce536e072b01791cb6`,
      { $set: { players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'New Player 5'] } }
    );
    // I thought this task was needed, but it doesn't seem like it is necessary.
    // I think that the "put" request is enough to make your page update and notice the update.
    // cy.task("refreshPage");
    page.getPlayers().should('have.lengthOf', 5);
  });

  it('Should read name input', () => {
    page.readNameInput('GEJ');
    page.nameButton().click();
  });

  it('Should enter response input', () => {
    page.readNameInput('GEJ');
    page.nameButton().click();
    page.readResponseInput('GEJ');
    page.responseButton().click();
    cy.get('.response').contains('GEJ').should('exist');
  });





});
