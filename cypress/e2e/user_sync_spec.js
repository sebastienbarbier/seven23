import moment from "moment";

describe("Users Sync", () => {
  const user = {
    username: `test${moment().format("YYYYMMDDHHmmss")}`,
    email: `test${moment().format("YYYYMMDDHHmmss")}@seven23.io`,
    password: "qwerty",
  };

  const account = {
    name: "test Account",
    currency: "Euro",
  };

  before(function () {
    cy.createUserWithApi(user, account);
  });

  it("Test categories, transactions, changes, with sync", () => {
    // Create Category 1
  //   cy.createCategory({
  //     name: "Category 1",
  //     description: "Description 1",
  //   });
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiBadge-badge").contains("1");
  //   cy.get("#user-popper").should("be.visible").click();
  //   // Create category 2 with Category 1 as Parent
  //   cy.createCategory({
  //     name: "Category 2",
  //     description: "Description 2",
  //     parent: "category 1",
  //   });
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiBadge-badge").contains("2");
  //   cy.get("#user-popper").should("be.visible").click();

  //   cy.createTransaction({
  //     label: "Transaction 1",
  //     category: "Category 1",
  //     price: -10.4,
  //   });
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiBadge-badge").contains("3");
  //   cy.get("#user-popper").should("be.visible").click();
  //   cy.get(".action > button").should("not.be.disabled");
  //   cy.get(".transaction > :nth-child(3) > span").contains("Category 1");
  //   cy.createTransaction({
  //     label: "Transaction 2",
  //     category: "Category 2",
  //     price: -11.4,
  //   });
  //   cy.get(":nth-child(3) > :nth-child(3) > span").contains(
  //     "Category 1 \\ Category 2"
  //   );
  //   cy.get('nav [href="/categories"]').should("be.visible").click();
  //   cy.get('[style="padding-left: 24px;"]').should("be.visible").click();

  //   cy.get(".action > button").should("not.be.disabled");
  //   cy.get(
  //     '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .hideMobile'
  //   ).contains("Category 1");
  //   cy.get(".action > button").should("not.be.disabled");
  //   cy.get(".transaction > :nth-child(3) > span")
  //     .should("be.visible")
  //     .contains("Category 1");
  //   // Edit category 1
  //   cy.get(
  //     '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .MuiButtonBase-root'
  //   )
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiPaper-root > :nth-child(1)").should("be.visible").click();
  //   cy.get("input#cy_category_name")
  //     .type("{backspace}")
  //     .type("3");
  //   cy.get(".MuiButton-contained").should("be.visible").click();
  //   cy.get(
  //     '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .hideMobile'
  //   ).contains("Category 3");
  //   cy.get(".action > button").should("not.be.disabled");
  //   cy.get(".transaction > :nth-child(3) > span").contains("Category 3");

  //   // Sync
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button")
  //     .should("be.visible")
  //     .click();
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button").should(
  //     "have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get(".MuiBadge-badge").should("not.be.visible");
  //   cy.get("#user-popper").should("be.visible").click();

  //   // Delete first category

  //   cy.get('nav [href="/categories"]').should("be.visible").click();
  //   cy.get('[style="padding-left: 24px;"]').should("be.visible").click();
  //   cy.get(
  //     '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .MuiButtonBase-root'
  //   )
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiPaper-root > :nth-child(4)").should("be.visible").click();
  //   cy.get(".MuiSnackbar-root > .MuiPaper-root").should("be.visible");

  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiBadge-badge").contains("2");
  //   cy.get("#user-popper").should("be.visible").click();

  //   cy.get(
  //     ".layout_content > .MuiList-root > .MuiButtonBase-root > .MuiListItemText-root > .MuiListItemText-primary"
  //   )
  //     .should("be.visible")
  //     .contains("Category 2");
  //   cy.get(".layout_content_search > .MuiButtonBase-root")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".MuiListItem-container > .MuiListItem-root")
  //     .should("be.visible")
  //     .click();
  //   cy.get(
  //     ".MuiListItem-container > .MuiListItem-root > .MuiListItemText-root > .MuiListItemText-primary"
  //   )
  //     .should("be.visible")
  //     .contains("Category 3");

  //   cy.get('nav [href="/transactions"]').should("be.visible").click();
  //   cy.get(".action > button").should("not.be.disabled");
  //   cy.get("tbody > :nth-child(2) > :nth-child(3) > span").contains(
  //     "Category 2"
  //   );
  //   cy.get(":nth-child(3) > :nth-child(3) > span").contains("Category 3");

  //   // Sync
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button")
  //     .should("be.visible")
  //     .click();
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button").should(
  //     "have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get(".cy_sync_button").should(
  //     "not.have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get(".MuiBadge-badge").should("not.be.visible");
  //   cy.get("#user-popper").should("be.visible").click();
  // });

  // it("Update id on transaction form while syncing (issue #33)", () => {
  //   cy.visit('/');
  //   cy.login(user);
  //   cy.get("#cy_login_form").should("not.be.visible");

  //   cy.get("nav .userButton button").click();
  //   cy.get(".cy_sync_button").should(
  //     "not.have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get("#user-popper").click();
  //   cy.createTransaction({
  //     label: "Transaction 3",
  //     price: 1337,
  //   });
  //   cy.get(
  //     ".transactionsList > tbody > :nth-child(2) > :nth-child(3)"
  //   ).contains("Transaction 3");
  //   cy.get(":nth-child(2) > .action > .MuiButtonBase-root")
  //     .should("be.visible")
  //     .click()

  //   // Close transition form

  //   cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]')
  //     .should("be.visible")
  //     .click();
  //   cy.get('footer > .MuiStack-root > .MuiButton-text')
  //     .should("be.visible")
  //     .click();

  //   //
  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button")
  //     .should("be.visible")
  //     .click();

  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button").should(
  //     "not.have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get("#user-popper").should("be.visible").click();

  //   // Open form
  //   cy.get(':nth-child(2) > .action > .MuiButtonBase-root').should("be.visible").click();
  //   cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').should("be.visible").click();

  //   cy.get("input#cy_transaction_name")
  //     .type("{backspace}")
  //     .type("4");
  //   cy.get(".MuiButton-contained").should("be.visible").click();

  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();

  //   cy.get(".cy_sync_button")
  //     .should("be.visible")
  //     .click();

  //   // Wait for a PUT request on udpate
  //   cy.intercept({
  //     method: 'PUT',
  //     url: `${Cypress.config('host')}/api/v1/debitscredits`,
  //   }).as('apiUpdate');
  //   cy.wait('@apiUpdate');

  //   cy.get("nav .userButton button")
  //     .should("be.visible")
  //     .click();
  //   cy.get(".cy_sync_button").should(
  //     "not.have.class",
  //     "Mui-disabled"
  //   );
  //   cy.get("#user-popper").should("be.visible").click();
  //   cy.get(
  //     ".transactionsList > tbody > :nth-child(2) > :nth-child(3)"
  //   ).contains("Transaction 4");
  });

  after(function () {
    cy.deleteUserWithApi(user);
  });
});