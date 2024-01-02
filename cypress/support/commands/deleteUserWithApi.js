
Cypress.Commands.add("deleteUserWithApi", (user) => {
  // From welcome page create a new account using available form
  // From welcome page create a new account using available form
  // create the user first in the DB

  cy.window().then((window) => {

    return cy.request({
      url: `${Cypress.config("host")}/api/v1/user/delete`, // assuming you've exposed a seeds route
      method: "DELETE",
      headers: { Authorization: "Token " + Cypress.env('token')},
      body: {
        password: user.password,
      },
    });
  });

});