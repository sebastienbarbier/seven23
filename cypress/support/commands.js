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
    ".makeStyles-container-332 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input"
  )
    .type("Euro")
    .type("{downarrow}")
    .type("{enter}");
  cy.get(".spaceBetween > .MuiButton-contained").click();
});
