Cypress.Commands.add("login", (user) => {
  // Setup test.seven23.io
  cy.get('[href="/select-account-type"]').click();
  cy.get('[href="/server"]').click();
  cy.get(
    "#cy_server_name"
  ).type(Cypress.config("host"));
  cy.get(
    "form"
  ).submit();

  cy.get(".serverButton")
    .should("be.visible")
    .contains(
      Cypress.config("host").replace("https://", "").replace("http://", "")
    );

  // login
  cy.get(
    "form #cy_username"
  ).type(user.username);
  cy.get("form #cy_password").type(
    user.password
  );
  cy.get(
    "form"
  ).submit();
});