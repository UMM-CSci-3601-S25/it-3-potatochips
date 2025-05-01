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

  // submitUsername() {
  //   return cy.get(this.submitUsername);
  // }

  // readResponseInput(code: string) {
  //   cy.get(this.responseInputField).type(code);
  //   return cy.get(this.responseInputField);
  // }

  // responseButton() {
  //   return cy.get(this.responseInputButton);
  // }

  // shuffleArray(array: any[]) {
  //   const shuffledArray = array.slice(); // Create a copy of the original array
  //   for (let i = shuffledArray.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  //   }
  //   return shuffledArray;
  // }


}
