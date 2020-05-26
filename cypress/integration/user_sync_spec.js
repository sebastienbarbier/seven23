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
    // Create category
    cy.createCategory({
      name: "Category 1",
      description: "Description 1",
    });
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiBadge-badge").contains("1");
    cy.get("#user-popper").click();

    cy.createCategory({
      name: "Category 2",
      description: "Description 2",
      parent: "category 1",
    });
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiBadge-badge").contains("2");
    cy.get("#user-popper").click();

    cy.createTransaction({
      label: "Transaction 1",
      category: "Category 1",
      price: -10.4,
    });
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiBadge-badge").contains("3");
    cy.get("#user-popper").click();
    cy.get(".action > button").should("not.be.disabled");
    cy.get(".transaction > :nth-child(3) > span").contains("Category 1");
    cy.createTransaction({
      label: "Transaction 2",
      category: "Category 2",
      price: -11.4,
    });
    cy.get(":nth-child(3) > :nth-child(3) > span").contains(
      "Category 1 \\ Category 2"
    );
    cy.get('[href="/categories"]').click();
    cy.get('[style="padding-left: 24px;"]').click();
    cy.get(".action > button").should("not.be.disabled");
    cy.get(
      '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .hideMobile'
    ).contains("Category 1");
    cy.get(".action > button").should("not.be.disabled");
    cy.get(".transaction > :nth-child(3) > span")
      .should("be.visible")
      .contains("Category 1");
    // Edit category 1
    cy.get(
      '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .MuiButtonBase-root'
    ).click();
    cy.get(".MuiPaper-root > :nth-child(1)").click();
    cy.get(".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input")
      .type("{backspace}")
      .type("3");
    cy.get(".MuiButton-contained").click();
    cy.get(
      '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .hideMobile'
    ).contains("Category 3");
    cy.get(".action > button").should("not.be.disabled");
    cy.get(".transaction > :nth-child(3) > span").contains("Category 3");

    // Sync
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").click();
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "have.class",
      "Mui-disabled"
    );
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "not.have.class",
      "Mui-disabled"
    );
    cy.get(".MuiBadge-badge").should("not.be.visible");
    cy.get("#user-popper").click();

    // Delete first category
    cy.get('[style="padding-left: 24px;"]').click();
    cy.get(
      '[style="display: flex; justify-content: flex-end; align-items: center; margin: 8px 20px;"] > .MuiButtonBase-root'
    ).click();
    cy.get(".MuiPaper-root > :nth-child(4)").click();
    cy.get(".MuiSnackbar-root > .MuiPaper-root").should("be.visible");

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiBadge-badge").contains("2");
    cy.get("#user-popper").click();

    cy.get(
      ".layout_content > .MuiList-root > .MuiButtonBase-root > .MuiListItemText-root > .MuiListItemText-primary"
    )
      .should("be.visible")
      .contains("Category 2");
    cy.get(".layout_content_search > .MuiButtonBase-root").click();
    cy.get(".MuiListItem-container > .MuiListItem-root").click();
    cy.get(
      ".MuiListItem-container > .MuiListItem-root > .MuiListItemText-root > .MuiListItemText-primary"
    )
      .should("be.visible")
      .contains("Category 3");

    cy.get('[href="/transactions"]').click();
    cy.get(".action > button").should("not.be.disabled");
    cy.get("tbody > :nth-child(2) > :nth-child(3) > span").contains(
      "Category 2"
    );
    cy.get(":nth-child(3) > :nth-child(3) > span").contains("Category 3");

    // Sync
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").click();
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "have.class",
      "Mui-disabled"
    );
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "not.have.class",
      "Mui-disabled"
    );
    cy.get(".MuiBadge-badge").should("not.be.visible");
    cy.get("#user-popper").click();
  });

  it("Update id on transaction form while syncing (issue #33)", () => {
    cy.createTransaction({
      label: "Transaction 3",
      price: 1337,
    });
    cy.get(
      ".transactionsList > tbody > :nth-child(2) > :nth-child(3)"
    ).contains("Transaction 3");
    cy.get(":nth-child(2) > .action > .MuiButtonBase-root").click();
    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").click();

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "not.have.class",
      "Mui-disabled"
    );
    cy.get("#user-popper").click();
    cy.get(".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input")
      .type("{backspace}")
      .type("4");
    cy.get(".MuiButton-contained").click();

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").click();

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(".MuiPaper-root > :nth-child(1) > .MuiButtonBase-root").should(
      "not.have.class",
      "Mui-disabled"
    );
    cy.get("#user-popper").click();
    cy.get(
      ".transactionsList > tbody > :nth-child(2) > :nth-child(3)"
    ).contains("Transaction 4");
  });

  after(function () {
    cy.deleteUserWithApi(user);
  });
});
