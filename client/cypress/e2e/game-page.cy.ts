import { GamePage } from '../support/game-page.po';

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
    cy.url().should(url => expect(url.includes('/game/123456789')).to.be.true);
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

  it('Should show all four players for this game', () => {
    page.getPlayers().should('have.lengthOf', 4);
  });

  it('Should update the list of players when one is added', () => {
    cy.task("connect");
    cy.url().then((url) => {
      const aGameId = url.split("/").reverse()[0];
      cy.task('addPlayer', {
        type: 'ADD_PLAYER',
        gameId: aGameId,
        playerName: 'Yvonne',
      })
    });
    page.getPlayers().should('have.lengthOf', 5);
  });

});
