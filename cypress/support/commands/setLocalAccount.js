import {
  GET_STARTED,
  GET_STARTED_CREATE_BUTTON,
  CREATE_ACCOUNT_NAME,
  CREATE_ACCOUNT_CURRENCIES,
} from '../selectors';

Cypress.Commands.add("setLocalAccount", () => {
  // This identify the get Started page using a dedicated id
  cy.get(GET_STARTED).should("be.visible");
  // Go to create account
  cy.get(GET_STARTED_CREATE_BUTTON).should("be.visible").click();
  cy.get(CREATE_ACCOUNT_NAME).type("Account 1");
  cy.get(CREATE_ACCOUNT_CURRENCIES)
    .type("Euro")
    .type("{enter}");
  cy.get("form").submit();
});