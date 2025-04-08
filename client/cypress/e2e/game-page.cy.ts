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

  it('Should read response input', () => {
    page.readResponseInput('GEJ');
    page.responseButton().click();
  });



});
