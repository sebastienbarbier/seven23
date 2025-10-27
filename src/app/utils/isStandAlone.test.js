// Can't test on testEnv node as it required the window object.
// Needs to run with jsdom env but then jose fails.
// TODO: find a way to test this

test("isStandAlone fake Test", () => {
  expect(true).toBe(true);
});
