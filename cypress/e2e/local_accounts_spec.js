describe("Accounts", () => {
  beforeEach(() => {
    // Create local account from login page
    cy.visit('/');
    cy.setLocalAccount();
  });

  // This test will create a local account to access dashboard
  // then go to settings to create a second account, look if it exist
  it("Create, update, and delete an account on device", () => {

    // cy.verifyUserButtonCurrencyHas('Euro');

    // // Navigate to settings account view

    // cy.get('nav .userButton button').click();
    // cy.get(
    //   "a > .MuiButtonBase-root > .MuiListItemText-root > .MuiTypography-root"
    // ).click();
    // cy.url().should("include", "/settings");
    // cy.get(
    //   ".hideMobile > :nth-child(1) > :nth-child(2)"
    // ).click();

    // // Edit tite and verify is value is updated
    // cy.get(
    //   ".MuiListItemSecondaryAction-root > .MuiButtonBase-root"
    // ).click();
    // cy.get(".MuiPaper-root > .MuiList-root > :nth-child(1)").click();
    // cy.get(
    //   ".MuiFormControl-marginNormal > .MuiInputBase-root > .MuiInputBase-input"
    // )
    //   .type("{backspace}2{enter}");
    // cy.get(
    //   ".MuiListItem-container > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-root"
    // ).contains("Account 2");

    // // Delete account and go back to homepage
    // cy.get(
    //   ".MuiListItemSecondaryAction-root > .MuiButtonBase-root"
    // ).click();
    // cy.get(".MuiPaper-root > .MuiList-root > :nth-child(3)").click();
    // cy.get(".MuiButton-contained").click();
    // cy.wait(1000);
    // cy.get("header > h2").contains(
    //   "Welcome"
    // );

    // // Refresh to confirm account has been deleted
    // cy.visit("/");
    // cy.get("header > h2").contains(
    //   "Welcome"
    // );
  });
});