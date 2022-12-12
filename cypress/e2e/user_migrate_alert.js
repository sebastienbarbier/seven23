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
    cy.createUserWithApi(user, account, true);
  });

  it("should login if a local account exist", () => {
    // Login form
    cy.get('.layout_content input#cy_name').type("Account 1");
    cy.get(
      ".layout_content .selectCurrency input"
    )
      .type("Euro")
      .type("{enter}");
    cy.get('#cy_only_on_device').click();
    cy.get("form").submit();
    cy.get(".amount > .balance").should("be.visible");
    cy.get("div#cy_migrate_alert").should("exist");
  });

  after(() => {
    cy.deleteUserWithApi(user);
  });
});
