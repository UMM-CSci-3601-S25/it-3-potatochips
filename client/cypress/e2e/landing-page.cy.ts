import { LandingPage } from '../support/landing-page.po';

const page = new LandingPage();

describe('Landing page', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should create game', () => {
    page.createGame().click();
    cy.url().should(url => expect(url.includes('')).to.be.true);
  });

  it('Should join game', () => {
    page.joinGame('123456').click();
    cy.url().should(url => expect(url.includes('/game/123456')).to.be.true);
  });
});
