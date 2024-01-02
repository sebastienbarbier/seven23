Cypress.Commands.add("verifyUserButtonCurrencyHas", (currency) => {
 // Open userButton
  cy.get(
    "nav .userButton button"
  ).click();
  cy.get('.MuiList-root > .MuiButtonBase-root').click();
  cy.get("#long-menu > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root")
    .contains(currency)
    .type("{esc}")
    .type("{esc}");
});