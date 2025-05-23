export class GamePage {
  //private readonly baseUrl = '/game/123456789';
  private readonly specificGameUrl = '/game/681266ce536e072b01791cb6';
  private readonly nameInputField = '#name-input';
  private readonly nameInputButton = '#name-button';
  private readonly responseInputField = '#response-input';
  private readonly responseInputButton = '#response-button';
  private readonly idInputField = '#rejoin-input';
  private readonly idInputButton = '#rejoin-button';


  navigateTo() {
    return cy.visit(this.specificGameUrl);
  }

  readNameInput(code: string) {
    cy.get(this.nameInputField).type(code);
    return cy.get(this.nameInputField);
  }

  nameButton() {
    return cy.get(this.nameInputButton);
  }

  readIdInput(code: string) {
    cy.get(this.idInputField).type(code);
    return cy.get(this.idInputField);
  }

  rejoinButton() {
    return cy.get(this.idInputButton);
  }

  readResponseInput(code: string) {
    cy.get(this.responseInputField).type(code);
    return cy.get(this.responseInputField);
  }

  responseButton() {
    return cy.get(this.responseInputButton);
  }

  // get all of the things in the DOM that include 'data-test="playerName"'
  getPlayers() {
    return cy.get('[data-test="playerName"]');
  }

}
