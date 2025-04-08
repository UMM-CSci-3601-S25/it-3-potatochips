export class LandingPage {
  private readonly baseUrl = '/';
  private readonly createGameButton = '#create-game';
  private readonly codeInputField = '#code-input';
  private readonly joinGameButton = '#join-game';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  createGame() {
    return cy.get(this.createGameButton);
  }

  joinGame(code: string) {
    cy.get(this.codeInputField).type(code);
    return cy.get(this.joinGameButton);
  }
}
