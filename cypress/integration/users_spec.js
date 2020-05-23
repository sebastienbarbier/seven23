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

  before(function () {
    Cypress.Cookies.preserveOnce("sessionid");
  });

  it("Create, pay, then delete", () => {
    cy.visit("/");
    // Setup test.seven23.io
    cy.get(
      ".open > .welcoming__layout > footer > .MuiButton-containedPrimary"
    ).click();
    cy.get(".content > .MuiButton-text").click();
    cy.get(
      ".open > .welcoming__layout > .content > form > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input"
    ).type("test.seven23.io");
    cy.get(
      ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    ).click();

    cy.get(".content > .MuiButton-text > .MuiButton-label > .text").contains(
      "test.seven23.io"
    );

    // signup
    cy.get(".spaceBetween > div > :nth-child(2)").click();
    cy.get("span > strong").contains("12 months");
    cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    cy.get(".MuiFormControlLabel-root").click();
    cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    cy.get(
      ":nth-child(2) > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type(user.username);
    cy.get("form > :nth-child(1) > :nth-child(2) > :nth-child(3)").type(
      user.email
    );
    cy.get(":nth-child(4) > .MuiInputBase-root > .MuiInputBase-input").type(
      user.password
    );
    cy.get("form > :nth-child(1) > :nth-child(2) > :nth-child(5)").type(
      user.password
    );
    cy.get(".extended > .MuiPaper-root > :nth-child(3)").click();
    cy.get('.MuiPaper-root > [tabindex="0"]').click();
    cy.get(
      '[style="display: flex; flex-direction: column;"] > .MuiButtonBase-root'
    ).click();

    // login
    cy.get(
      ".open > .welcoming__layout > .content > form > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input"
    ).type(user.username);
    cy.get(":nth-child(3) > .MuiInputBase-root > .MuiInputBase-input").type(
      user.password
    );
    cy.get(
      ".open > .welcoming__layout > .content > form > .MuiButtonBase-root"
    ).click();
    cy.get(
      '.layout_content > form > [style="width: 100%; margin-bottom: 16px;"] > .MuiInputBase-root > .MuiInputBase-input'
    ).type(account.name);
    cy.get(
      ".makeStyles-container-711 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input"
    )
      .type(account.currency)
      .type("{esc}");
    cy.get(".spaceBetween > .MuiButton-contained").click();

    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(
      '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
    ).click();

    // Pay
    cy.get(".right > .wrapperMobile > .MuiButtonBase-root").click();
    cy.get(
      '[style="padding: 0px; margin: 0px;"] > a > .MuiButtonBase-root'
    ).click();
    cy.get(".layout_content > :nth-child(2) > :nth-child(5)").click();
    cy.wait(1000);
    cy.get(".layout_content > :nth-child(2) > :nth-child(4)").click();
    cy.wait(500);
    cy.get(".layout_content > :nth-child(2) > :nth-child(5)").click();
    cy.get("#customButton").click();
    cy.wait(4000);

    // Working with iframes
    // https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
    //
    // cy.get('.stripe_checkout_app').then($iframe => {
    //   console.log($iframe[$iframe.length-1])
    //   console.log($iframe[$iframe.length-1].contentWindow)
    //   console.log($iframe[$iframe.length-1].contentWindow.document)
    //   var iframe = $iframe[$iframe.length-1]
    //   const doc = $iframe[$iframe.length-1].contentWindow.document
    //   console.log(doc)
    //   let input = doc.find('input')[0]
    //   cy
    //     .wrap(input)
    //     .type(user.email)
    //   input = doc.find('input')[1]
    //   // super weird stuff here, if you just input '4242424242424242', the value
    //   // that you end up seing in the input element is jumbled up a little,
    //   // probably because of the way how Stripe inserts spaces while you are
    //   // typing. By luck I found out that this issue can get worked around if
    //   // you just chain-call type()
    //   cy
    //     .wrap(input)
    //     .type('4242')
    //     .type('4242')
    //     .type('4242')
    //     .type('4242')
    //   input = doc.find('input')[2]
    //   cy
    //     .wrap(input)
    //     .clear()
    //     .type('12')
    //     .type('20')
    //   input = doc.find('input')[3]
    //   cy
    //     .wrap(input)
    //     .type('123')
    //     .type('{enter}')
    // })
    // Delete account
    // cy.get('.layout_content > :nth-child(2) > :nth-child(2)').click()
    // cy.get('.layout_noscroll > .MuiList-root > :nth-child(7)').click()
    // cy.get('.MuiInputBase-input').type('wrong password')
    // cy.get('.MuiButton-contained').click()
    // cy.get('.MuiFormHelperText-root').contains('Password incorrect')
    // cy.get('.MuiInputBase-input').type(user.password)
    // cy.get('.MuiButton-contained').click()

    // // Back to welcome page
    // cy.get(".open > .welcoming__layout > header > h2").contains(
    // "Welcome on board"
    // );
  });
});
