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

  it("Create, pay, then delete", () => {
    // Create category
    cy.get('[href="/categories"]').click();
    cy.get(".MuiFab-root").click();
    cy.get(
      ".form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type("Category 1");
    cy.get(".MuiButton-contained").click();
  });

  after(function () {
    cy.deleteUserWithApi(user);
  });
});
