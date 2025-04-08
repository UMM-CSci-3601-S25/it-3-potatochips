export class GamePage {
  private readonly baseUrl = '/game/123456789';
  private readonly nameInputField = '#name-input';
  private readonly nameInputButton = '#name-button';
  private readonly responseInputField = '#response-input';
  private readonly responseInputButton = '#response-button';


  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  readNameInput(code: string) {
    cy.get(this.nameInputField).type(code);
    return cy.get(this.nameInputField);
  }

  nameButton() {
    return cy.get(this.nameInputButton);
  }

  readResponseInput(code: string) {
    cy.get(this.responseInputField).type(code);
    return cy.get(this.responseInputField);
  }

  responseButton() {
    return cy.get(this.responseInputButton);
  }



}
