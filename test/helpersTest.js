const { assert } = require('chai');

const getUserByEmail = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput)
  });
  it('should not return a user with non-valid email', function () {
    const user = getUserByEmail(testUsers, "user2@example.com")
    const expectedOutput = "userRandomID";
    assert.notStrictEqual(user, expectedOutput)
  });
  it('should return undefined with non-valid email', function () {
    const user = getUserByEmail(testUsers, "user3@example.com")
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput)
  });
});