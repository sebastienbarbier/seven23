describe("My First Test", () => {
  it("Does not do much!", () => {
    cy.visit("/");
    cy.get(
      ".open > .welcoming__layout > footer > .MuiButton-containedPrimary"
    ).click();
    cy.get(
      ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type("sbarbier");
    cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
      "12345"
    );
    cy.get(
      ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    ).click();
    cy.contains("Unable to log in with provided credentials.");
  });
});
