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
    cy.get("div#cy_get_started").should("be.visible");
    cy.setLocalAccount();
    cy.get("nav .userButton button").click();
    cy.get('[href="/settings"]').click();
    cy.get('.hideMobile > :nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiButton-disableElevation').click();
    cy.get('.layout > .layout_content').should("be.visible");
    // Login form
    cy.get(
      "#cy_username"
    ).type(user.username);
    cy.get("#cy_password").type(
      user.password
    );
    cy.get(
      "form#cy_login_form"
    ).submit();
    cy.get("form#cy_login_form").should("not.be.visible");
    cy.get(".amount > .balance").should("be.visible");
  });

  after(() => {
    cy.deleteUserWithApi(user);
  });
});