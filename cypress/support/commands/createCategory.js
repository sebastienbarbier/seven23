Cypress.Commands.add("createCategory", (category) => {
  cy.get('nav [href="/categories"]').click();
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