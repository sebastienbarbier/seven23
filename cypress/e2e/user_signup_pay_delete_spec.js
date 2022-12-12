import moment from "moment";

describe("Users", () => {
  const user = {
    username: `test${moment().format("YYYYMMDDHHmmss")}`,
    email: `test${moment().format("YYYYMMDDHHmmss")}@seven23.io`,
    password: "qwerty",
  };

  const account = {
    name: "test Account",
    currency: "Euro",
  };

  it("Create, pay, then delete", { retries: 3 }, () => {
    cy.visit("/");
    // Setup test.seven23.io
    // cy.get(
    //   ".open > .welcoming__layout > footer > .MuiButton-containedPrimary"
    // ).click();
    // cy.get(".content > .MuiButton-text").click();
    // cy.get(
    //   ".open > .welcoming__layout > .content > form > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input"
    // ).type(Cypress.config("host"));
    // cy.get(
    //   ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    // ).click();

    // cy.get(".text")
    //   .should("be.visible")
    //   .contains(
    //     Cypress.config("host").replace("https://", "").replace("http://", "")
    //   );

    // // signup
    // cy.get(".spaceBetween > div > :nth-child(2)").click();
    // cy.get("span > strong").contains("12 months");
    // cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    // cy.get(".MuiFormControlLabel-root").click();
    // cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    // cy.get(
    //   ":nth-child(2) > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    // ).type(user.username);
    // cy.get("form > :nth-child(1) > :nth-child(2) > :nth-child(3)").type(
    //   user.email
    // );
    // cy.get(":nth-child(4) > .MuiInputBase-root > .MuiInputBase-input").type(
    //   user.password
    // );
    // cy.get("form > :nth-child(1) > :nth-child(2) > :nth-child(5)").type(
    //   user.password
    // );
    // cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    // cy.get('.MuiPaper-root > [tabindex="0"]').click();
    // cy.get(
    //   '[style="display: flex; flex-direction: column;"] > .MuiButtonBase-root'
    // ).click();

    // // login
    // cy.get(
    //   ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    // ).type(user.username);
    // cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
    //   user.password
    // );
    // cy.get(
    //   ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    // ).click();
    // cy.get(
    //   '.layout_content > form > [style="width: 100%; margin-bottom: 16px;"] > .MuiInputBase-root > .MuiInputBase-input'
    // ).type(account.name);
    // cy.get(
    //   ".selectCurrency > div > div > div > .MuiInputBase-root > .MuiInputBase-input"
    // )
    //   .type(account.currency)
    //   .type("{esc}");
    // cy.get(".spaceBetween > .MuiButton-contained").click();

    // cy.get("#toolbar > .wrapperMobile > .MuiButtonBase-root").click();
    // cy.get(
    //   '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
    // ).click();

    // // Pay
    // cy.get("#toolbar > .wrapperMobile > .MuiButtonBase-root").click();
    // cy.get(
    //   '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
    // ).click();

    // cy.get(".layout_content > :nth-child(2) > :nth-child(5)").click();
    // cy.get(".year").contains(new Date().getFullYear());
    // cy.get(".MuiInputBase-input").type("TEST_FULL_DISCOUNT");
    // cy.get(".coupon > .MuiButtonBase-root").click();
    // cy.get("#customButton").click();
    // cy.get(".MuiTableBody-root > .MuiTableRow-root > :nth-child(3)").contains(
    //   "TEST_FULL_DISCOUNT"
    // );
    // cy.get(".year").contains(new Date().getFullYear() + 1);
    // // Delete account
    // cy.get(".layout_content > :nth-child(2) > :nth-child(2)").click();
    // cy.get(".layout_noscroll > .MuiList-root > :nth-child(7)").click();
    // cy.get(".MuiInputBase-input").type("wrong password");
    // cy.get(".MuiButton-contained").click();
    // cy.get(".MuiFormHelperText-root").contains("Password incorrect");
    // cy.get(".MuiInputBase-input").type(user.password);
    // cy.get(".MuiButton-contained").click();

    // // Back to welcome page
    // cy.get(".open > .welcoming__layout > header > h2").contains(
    //   "Welcome on board"
    // );
  });
});