describe("Transactions", () => {
  beforeEach(() => {
    cy.setLocalAccount();
  });

  it("Transaction", () => {
    // Create accoutn from login page
    cy.get('[href="/transactions"]').click();
    cy.contains("No transactions");

    // Transaction 1
    cy.get(".layout_noscroll > :nth-child(1) > .MuiButtonBase-root").click();
    cy.get(
      ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type("Transaction 1");
    cy.get(
      '[style="display: flex; flex-direction: row;"] > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input'
    ).type("10,4");
    cy.get(".MuiButton-contained").click();
    cy.get(".transaction > :nth-child(3)").contains("Transaction 1");
    cy.get(
      '[style="text-align: right; font-weight: 400; padding-left: 10px;"]'
    ).contains("- 10.40 €");

    cy.get(".incomes_expenses > :nth-child(2)").contains("- 10.40 €");

    // Transaction 2
    cy.get(".layout_noscroll > :nth-child(1) > .MuiButtonBase-root").click();
    cy.get(
      ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type("Transaction 2");
    cy.get(
      '[style="display: flex; flex-direction: row;"] > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input'
    ).type("22.4");
    cy.get(".MuiButton-contained").click();
    cy.get(":nth-child(3) > :nth-child(3)").contains("Transaction 2");
    cy.get(
      '[style="text-align: right; font-weight: 400; padding-left: 10px;"]'
    ).contains("- 22.40 €");

    cy.get(".incomes_expenses > :nth-child(2)").contains("- 32.80 €");

    // Test undo on delete event
    cy.get(
      ":nth-child(2) > .makeStyles-actionsContainer-1008 > .MuiButtonBase-root"
    ).click();
    cy.get(".MuiPaper-root > .MuiList-root > :nth-child(4)").click();

    cy.get(
      ".MuiSnackbarContent-action > .MuiButtonBase-root > .MuiButton-label"
    ).click();
    cy.get(".incomes_expenses > :nth-child(2)").contains("- 32.80 €");

    // Delete both
    cy.get(
      ":nth-child(2) > .makeStyles-actionsContainer-1008 > .MuiButtonBase-root"
    ).click();
    cy.get(".MuiPaper-root > .MuiList-root > :nth-child(4)").click();
    cy.get(
      ":nth-child(2) > .makeStyles-actionsContainer-1008 > .MuiButtonBase-root"
    ).click();
    cy.get(".MuiPaper-root > .MuiList-root > :nth-child(4)").click();
    cy.contains("No transactions");

    // Transaction 1
    cy.get(".layout_noscroll > :nth-child(1) > .MuiButtonBase-root").click();
    cy.get(
      ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type("Transaction 1");
    cy.get(
      ".MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root > .MuiIconButton-label > .PrivateSwitchBase-input-1250"
    ).click();
    cy.get(
      '[style="display: flex; flex-direction: row;"] > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input'
    ).type("10,4");
    cy.get(".MuiButton-contained").click();
    cy.get(".transaction > :nth-child(3)").contains("Transaction 1");
    cy.get(
      '[style="text-align: right; font-weight: 400; padding-left: 10px;"]'
    ).contains("10.40 €");

    cy.get(".incomes_expenses > :nth-child(1)").contains("10.40 €");
    cy.get(".incomes_expenses > :nth-child(2)").contains("0.00 €");
  });
});
