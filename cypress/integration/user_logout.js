import moment from "moment";

describe("User logout", () => {
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

  it("Logout refused if unsynced then force", () => {
    cy.logout();
    cy.get(".open > .welcoming__layout > header > h2").should("be.visible");
    cy.login(user);
    cy.get(".welcoming__wrapper").should("not.be.visible");
  });

  after(() => {
    cy.deleteUserWithApi(user);
  });
});
