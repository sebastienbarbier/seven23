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
    // cy.logout();
    // cy.get("div#cy_get_started").should("be.visible");
    // cy.login(user);
    // cy.get("#cy_login_form").should("not.be.visible");

    // cy.get("nav .userButton button").click();

    // cy.get("#user-popper").click();
    // cy.createTransaction({
    //   label: "Transaction 2",
    //   price: -11.4,
    // });
    // cy.logout(true);
  });

  after(() => {
    cy.deleteUserWithApi(user);
  });
});