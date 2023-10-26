Cypress.Commands.add("createTransaction", (transaction) => {
  cy.get('nav [href="/transactions"]').click();
  cy.get(".MuiFab-root").click();
  cy.get("input#cy_transaction_name").type(transaction.label);

  if (transaction.price > 0) {
    cy.get(".MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root")
      .should("be.visible")
      .click();
  }

  cy.get('input#cy_transaction_amount').type(Math.abs(transaction.price));
  cy.get("form #cy_transaction_date").click().type(`{backspace}${(new Date()).getDate()}${(new Date()).getMonth()+1}${(new Date()).getFullYear()}`);
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