describe("Accounts", () => {
  beforeEach(() => {
    // Create local account from login page
    cy.setLocalAccount();
  });

  it("Create, update, and delete an account on device", () => {
    // Verify is selected currency is correct on menu
    cy.get(
      ".right > .wrapperMobile > .MuiButtonBase-root > .MuiButton-label > .badgeSync > .MuiAvatar-root > .MuiSvgIcon-root"
    ).click();
    cy.get(
      "div.hideDesktop > :nth-child(1) > .MuiList-root > .MuiButtonBase-root > .MuiListItemText-root"
    ).click();
    cy.get("#long-menu > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root")
      .contains("Euro")
      .type("{esc}")
      .type("{esc}");
    // Navigate to settings account view
    cy.get(
      ".right > .wrapperMobile > .MuiButtonBase-root > .MuiButton-label > .badgeSync > .MuiAvatar-root > .MuiSvgIcon-root"
    ).click();
    cy.get(
      "a > .MuiButtonBase-root > .MuiListItemText-root > .MuiTypography-root"
    ).click();
    cy.url().should("include", "/settings");
    cy.get(
      ":nth-child(1) > :nth-child(2) > .MuiListItemIcon-root > .MuiSvgIcon-root"
    ).click();
    // Edit tite and verify is value is updated
    cy.get(
      ".MuiListItemSecondaryAction-root > .MuiButtonBase-root > .MuiIconButton-label > .MuiSvgIcon-root"
    ).click();
    cy.get(".MuiPaper-root > .MuiList-root > :nth-child(1)").click();
    cy.get(
      ".MuiFormControl-marginNormal > .MuiInputBase-root > .MuiInputBase-input"
    )
      .type("{backspace}")
      .type("2")
      .type("{enter}");
    cy.get(
      ".MuiListItem-container > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-root"
    ).contains("Account 2");
    // Delete account and go back to homepage
    cy.get(
      ".MuiListItemSecondaryAction-root > .MuiButtonBase-root > .MuiIconButton-label > .MuiSvgIcon-root"
    ).click();
    cy.get(".MuiPaper-root > .MuiList-root > :nth-child(3)").click();
    cy.get(".MuiButton-contained").click();
    cy.wait(1000);
    cy.get(".open > .welcoming__layout > header > h2").contains(
      "Welcome on board"
    );
    // Refresh to confirm account has been deleted
    cy.visit("/");
    cy.get(".open > .welcoming__layout > header > h2").contains(
      "Welcome on board"
    );
  });
});
