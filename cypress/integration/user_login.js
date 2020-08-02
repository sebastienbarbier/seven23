import moment from "moment";

describe("User login", () => {
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

  it("should login if a local account exist", () => {
    cy.logout();
    cy.setLocalAccount();
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get('[style="padding: 0px; margin: 0px;"] > :nth-child(5)').click();
    cy.get(".open > .welcoming__layout > header > h2").should("be.visible");
    // Login form
    cy.get(
      ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type(user.username);
    cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
      user.password
    );
    cy.get(
      ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    ).click();
    cy.get(".open > .welcoming__layout > header > h2").should("not.be.visible");

    cy.get(".amount > .balance").should("be.visible");
  });

  after(() => {
    cy.deleteUserWithApi(user);
  });
});
