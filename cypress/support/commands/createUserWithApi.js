
Cypress.Commands.add("createUserWithApi", (user, account, ignoreCreateAccount = false) => {
  // From welcome page create a new account using available form
  // create the user first in the DB
  cy.request({
    url: `${Cypress.config("host")}/api/v1/rest-auth/registration/`, // assuming you've exposed a seeds route
    method: "POST",
    body: {
      username: user.username,
      email: user.email,
      password1: user.password,
      password2: user.password,
      origin: "",
    },
  })
    .its("body")
    .then((body) => {
      Cypress.env('token', body.key)
      cy.visit("/");
      // Setup test.seven23.io
      cy.get('[href="/select-account-type"]').click();
      cy.get('[href="/server"]').click();
      cy.get(
        "#cy_server_name"
      ).type(Cypress.config("host"));
      cy.get(
        "form"
      ).submit();

      cy.get("#cy_server_button")
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

      // if (!ignoreCreateAccount) {
      //   cy.get('.layout_content input#cy_name').type("Account 1");
      //   cy.get(
      //     ".layout_content .selectCurrency input"
      //   )
      //     .type("Euro")
      //     .type("{enter}");
      //   cy.get("form").submit();
      // }

    });
});