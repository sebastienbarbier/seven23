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
  cy.visit("/");
  cy.get(".open > .welcoming__layout > footer > :nth-child(1)").click();
  cy.get(
    '.layout_content > form > [style="width: 100%; margin-bottom: 16px;"] > .MuiInputBase-root > .MuiInputBase-input'
  ).type("Account 1");
  cy.get(
    ".selectCurrency > div > div > div > .MuiInputBase-root > .MuiInputBase-input"
  )
    .type("Euro")
    .type("{downarrow}")
    .type("{enter}");
  cy.get(".spaceBetween > .MuiButton-contained").click();
});

Cypress.Commands.add("createTransaction", (transaction) => {
  cy.get('[href="/transactions"]').click();
  cy.get(".layout_noscroll > :nth-child(1) > .MuiButtonBase-root").click();
  cy.get(
    ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
  ).type(transaction.label);

  if (transaction.price > 0) {
    cy.get(".MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root")
      .should("be.visible")
      .click();
  }

  cy.get(
    '[style="display: flex; flex-direction: row;"] > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input'
  ).type(Math.abs(transaction.price));

  cy.get(".dateFieldWithButtons > .MuiFormControl-root > .MuiInput-root > input").click().type(`{backspace}{backspace}{backspace}{backspace}${(new Date()).getFullYear()}`);
  if (transaction.category) {
    cy.get(
      ':nth-child(5) > div[role="combobox"] > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input'
    )
      .type(transaction.category)
      .type("{downarrow}")
      .type("{enter}");
  }
  cy.get(".MuiButton-contained").click();
  cy.get(".modalContent").should("not.be.visible");
});

Cypress.Commands.add("createCategory", (category) => {
  cy.get('[href="/categories"]').click();
  cy.get(".MuiFab-root").click();
  cy.get(
    ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
  ).type(category.name);

  if (category.description) {
    cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
      category.description
    );
  }
  if (category.parent) {
    cy.get(
      'div[role="combobox"] > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input'
    )
      .type(category.parent)
      .type("{downarrow}")
      .type("{enter}");
  }
  cy.get(".MuiButton-contained").click();
  cy.get(".modalContent").should("not.be.visible");
});

Cypress.Commands.add("createChange", (change) => {
  cy.get('[href="/changes"]').click();
});

let token;

Cypress.Commands.add("createUserWithApi", (user, account) => {
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
      cy.get(
        ".open > .welcoming__layout > footer > .MuiButton-containedPrimary"
      ).click();
      cy.get(".content > .MuiButton-text").click();
      cy.get(
        ".open > .welcoming__layout > .content > form > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input"
      ).type(Cypress.config("host"));
      cy.get(
        ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
      ).click();

      cy.get(".text")
        .should("be.visible")
        .contains(
          Cypress.config("host").replace("https://", "").replace("http://", "")
        );

      // login
      cy.get(
        ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
      ).type(user.username);
      cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
        user.password
      );
      cy.get(
        ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
      ).click();
      cy.get(
        '.layout_content > form > [style="width: 100%; margin-bottom: 16px;"] > .MuiInputBase-root > .MuiInputBase-input'
      ).type(account.name);
      cy.get(
        ".selectCurrency > div > div > div > .MuiInputBase-root > .MuiInputBase-input"
      )
        .type(account.currency)
        .type("{esc}");
      cy.get(".spaceBetween > .MuiButton-contained").click();
    });
});

Cypress.Commands.add("login", (user) => {
  cy.get(
    ".open > .welcoming__layout > footer > .MuiButton-containedPrimary"
  ).click();
  cy.get(
    ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
  ).type(user.username);
  cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
    user.password
  );
  cy.get(
    ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
  ).click();
});

Cypress.Commands.add("logout", (force) => {
  cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
  cy.get(
    '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
  ).click();
  cy.get(":nth-child(2) > a > .MuiButtonBase-root").click();
  if (force) {
    cy.get(".MuiSnackbar-root").should("be.visible");
    cy.get(".MuiSnackbarContent-action > .MuiButtonBase-root").should("be.visible").click();
    cy.get(".open > .welcoming__layout > header > h2").should("be.visible");
  } else {
    cy.get(".open > .welcoming__layout > header > h2").should("be.visible");
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