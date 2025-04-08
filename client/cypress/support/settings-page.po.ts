export class SettingsPage {
  private readonly baseUrl = '/settings/123456789';
  private readonly gameCode = '#game-code';
  private readonly startGameButton = '#start-game';
  private readonly toggleSwitch = '.centered-toggle';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  readCode() {
    return cy.get(this.gameCode).invoke('attr', 'innerText');
  }

  startGame() {
    return cy.get(this.startGameButton);
  }

  toggleTest() {
    return cy.get(this.toggleSwitch);
  }
}
