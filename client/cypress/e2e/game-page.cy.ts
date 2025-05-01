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

  // it('Should show all four players for this game', () => {
  //   page.submitUsername().should('have.lengthOf', 4);
  // })


  // it('Should enter response input', () => {
  //   page.readNameInput('GEJ');
  //   page.nameButton().click();
  //   page.readResponseInput('GEJ');
  //   page.responseButton().click();
  //   cy.get('.response').contains('GEJ').should('exist');
  // });

  // it('Should shuffleArray', () => {
  //   const array = [1, 2, 3, 4, 5];
  //   const shuffledArray = page.shuffleArray(array);
  });
// });
