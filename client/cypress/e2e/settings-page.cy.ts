import { SettingsPage } from '../support/settings-page.po';

const page = new SettingsPage();

describe('Settings page', () => {

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

  // it('Should join game', () => {
  //   page.joinGame('123456').click();
  //   cy.url().should(url => expect(url.includes('/game/')).to.be.true);
  // });

  it('Should look at the url and check if it\'s correct', () => {
    cy.url().should(url => expect(url.endsWith('/settings/123456789')).to.be.true);
  });


  // it('Should read the game code', () => {
  //   page.readCode().should(text => expect(text.endsWith('123456789')).to.be.true);
  // });

  it('Should start game', () => {
    page.startGame().click();
    cy.url().should(url => expect(url.includes('')).to.be.true);
  });

});
