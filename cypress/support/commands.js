// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("setLocalAccount", () => {
  // From welcome page create a new account using available form
  cy.get("div#cy_get_started").should("be.visible");
  cy.get('[href="/create-account"]').should("be.visible");
  cy.get('[href="/create-account"]').click();
  cy.get('.layout_content input#cy_name').type("Account 1");
  cy.get(
    ".layout_content .selectCurrency input"
  )
    .type("Euro")
    .type("{enter}");
  cy.get("form").submit();
});

Cypress.Commands.add("createTransaction", (transaction) => {
  cy.get('[href="/transactions"]').click();
  cy.get(".layout_noscroll > :nth-child(1) > .MuiButtonBase-root").click();
  cy.get("input#cy_transaction_name").type(transaction.label);

  if (transaction.price > 0) {
    cy.get(".MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root")
      .should("be.visible")
      .click();
  }

  cy.get('input#cy_transaction_amount').type(Math.abs(transaction.price));
  cy.get("form #cy_transaction_date").click().type(`{backspace}{backspace}{backspace}{backspace}${(new Date()).getFullYear()}`);
  if (transaction.category) {
    cy.get(
      'input#cy_transaction_category'
    )
      .type(transaction.category)
      .type("{enter}");
  }
  cy.get(".MuiButton-contained").click();
  cy.get(".modalContent").should("not.be.visible");
});

Cypress.Commands.add("createCategory", (category) => {
  cy.get('[href="/categories"]').click();
  cy.get(".MuiFab-root").click();
  cy.get(
    "input#cy_category_name"
  ).type(category.name);

  if (category.description) {
    cy.get("input#cy_category_description").type(
      category.description
    );
  }
  if (category.parent) {
    cy.get(
      'input#cy_category_parent'
    )
      .type(category.parent)
      .type("{enter}");
  }
  cy.get(".MuiButton-contained").click();
  cy.get(".modalContent").should("not.be.visible");
});

Cypress.Commands.add("createChange", (change) => {
  cy.get('[href="/changes"]').click();
});

let token;

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
      token = body.key;
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

      if (!ignoreCreateAccount) {
        cy.get('.layout_content input#cy_name').type("Account 1");
        cy.get(
          ".layout_content .selectCurrency input"
        )
          .type("Euro")
          .type("{enter}");
        cy.get("form").submit();
      }

    });
});

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

Cypress.Commands.add("logout", (force) => {
  cy.get('#toolbar > .wrapperMobile > .MuiButtonBase-root').click();
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

Cypress.Commands.add("deleteUserWithApi", (user) => {
  // From welcome page create a new account using available form
  // From welcome page create a new account using available form
  // create the user first in the DB
  cy.request({
    url: `${Cypress.config("host")}/api/v1/user/delete`, // assuming you've exposed a seeds route
    method: "DELETE",
    headers: { Authorization: "Token " + token },
    body: {
      password: user.password,
    },
  });
});