Cypress.Commands.add("logout", (force) => {
  cy.get('nav .userButton button').click();
  cy.get(
    '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
  ).click();
  cy.get("#cy_logout_button").click();
  if (force) {
    cy.get(".MuiSnackbar-root").should("be.visible");
    cy.get(".MuiSnackbarContent-action > .MuiButtonBase-root").should("be.visible").click();
    cy.get("div#cy_get_started").should("be.visible");
  } else {
    cy.get("div#cy_get_started").should("be.visible");
  }
});